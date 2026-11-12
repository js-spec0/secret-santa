"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import {
  checkAdminPassword,
  createAdminSession,
  destroyAdminSession,
  requireAdmin,
} from "@/lib/admin-auth";
import { db, getSettings, type Participant } from "@/lib/db";
import { createTransport, sendRevealEmail } from "@/lib/mail";

export type ActionResult = { ok: boolean; message: string };

// ---------------------------------------------------------------------------
// Přihlášení admina
// ---------------------------------------------------------------------------

export async function login(_prev: string | null, formData: FormData): Promise<string | null> {
  const password = String(formData.get("password") ?? "");
  if (!checkAdminPassword(password)) {
    await new Promise((r) => setTimeout(r, 500)); // zpomalí hádání hesla
    return "Špatné heslo.";
  }
  await createAdminSession();
  redirect("/admin");
}

export async function logout() {
  await destroyAdminSession();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Přihlášky
// ---------------------------------------------------------------------------

export async function setRegistrationOpen(open: boolean): Promise<ActionResult> {
  await requireAdmin();
  const settings = await getSettings();
  if (open && settings.drawn_at) {
    return {
      ok: false,
      message: "Losování už proběhlo. Než přihlášky znovu otevřeš, losování zruš.",
    };
  }
  const { error } = await db().from("settings").update({ registration_open: open }).eq("id", 1);
  if (error) return fail("Nepodařilo se změnit stav přihlášek.", error);
  refresh();
  return { ok: true, message: open ? "Přihlášky jsou otevřené." : "Přihlášky jsou uzavřené." };
}

export async function deleteParticipant(id: string): Promise<ActionResult> {
  await requireAdmin();
  const settings = await getSettings();
  if (settings.drawn_at) {
    return { ok: false, message: "Po losování nejde mazat. Nejdřív losování zruš." };
  }
  const { error } = await db().from("participants").delete().eq("id", id);
  if (error) return fail("Smazání se nepovedlo.", error);
  refresh();
  return { ok: true, message: "Účastník smazán." };
}

// ---------------------------------------------------------------------------
// Losování
// ---------------------------------------------------------------------------

const DRAW_ERRORS: Record<string, string> = {
  REGISTRATION_OPEN: "Nejdřív uzavři přihlášky.",
  ALREADY_DRAWN: "Losování už proběhlo.",
  NOT_ENOUGH_PARTICIPANTS: "K losování jsou potřeba aspoň 3 účastníci.",
};

export async function drawPairs(): Promise<ActionResult> {
  await requireAdmin();
  const { data, error } = await db().rpc("draw_pairs");
  if (error) {
    const known = Object.keys(DRAW_ERRORS).find((k) => error.message.includes(k));
    if (known) return { ok: false, message: DRAW_ERRORS[known] };
    return fail("Losování se nepovedlo.", error);
  }
  refresh();
  return { ok: true, message: `Vylosováno! Počet účastníků: ${data}.` };
}

export async function resetDraw(): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await db().rpc("reset_draw");
  if (error) return fail("Zrušení losování se nepovedlo.", error);
  refresh();
  return { ok: true, message: "Losování zrušeno. Můžeš losovat znovu." };
}

// ---------------------------------------------------------------------------
// Emaily
// ---------------------------------------------------------------------------

type Recipient = Pick<Participant, "id" | "name" | "email" | "token">;

async function sendTo(recipients: Recipient[]): Promise<ActionResult> {
  const settings = await getSettings();
  if (!settings.drawn_at) return { ok: false, message: "Nejdřív proveď losování." };
  if (recipients.length === 0) return { ok: true, message: "Všem už email odešel." };

  const transport = createTransport();
  const failed: string[] = [];
  try {
    for (const r of recipients) {
      try {
        await sendRevealEmail(transport, r);
        await db()
          .from("participants")
          .update({ email_sent_at: new Date().toISOString() })
          .eq("id", r.id);
      } catch (e) {
        console.error(`email to ${r.email} failed`, e);
        failed.push(r.email);
      }
    }
  } finally {
    transport.close();
  }

  refresh();
  const sent = recipients.length - failed.length;
  if (failed.length > 0) {
    return { ok: false, message: `Odesláno ${sent}, nepovedlo se: ${failed.join(", ")}.` };
  }
  return { ok: true, message: `Odesláno emailů: ${sent}.` };
}

export async function sendPendingEmails(): Promise<ActionResult> {
  await requireAdmin();
  const { data, error } = await db()
    .from("participants")
    .select("id, name, email, token")
    .is("email_sent_at", null)
    .not("receiver_id", "is", null);
  if (error) return fail("Nepodařilo se načíst účastníky.", error);
  return sendTo(data);
}

export async function resendEmail(id: string): Promise<ActionResult> {
  await requireAdmin();
  const { data, error } = await db()
    .from("participants")
    .select("id, name, email, token")
    .eq("id", id)
    .single();
  if (error) return fail("Účastník nenalezen.", error);
  return sendTo([data]);
}

function fail(message: string, error: unknown): ActionResult {
  console.error(message, error);
  return { ok: false, message };
}
