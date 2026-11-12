import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { PageShell } from "@/components/card";
import { requireAdmin } from "@/lib/admin-auth";
import { getSettings, listParticipantsForAdmin } from "@/lib/db";
import { ActionButton } from "./action-button";
import {
  deleteParticipant,
  drawPairs,
  logout,
  resendEmail,
  resetDraw,
  sendPendingEmails,
  setRegistrationOpen,
} from "./actions";

export const metadata: Metadata = { title: "Admin · Secret Santa" };

export default function AdminPage() {
  return (
    <PageShell wide>
      <Suspense fallback={<p className="text-sm text-gray-500">Načítám…</p>}>
        <Dashboard />
      </Suspense>
    </PageShell>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("cs-CZ", {
    timeZone: "Europe/Prague",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function Dashboard() {
  await requireAdmin(); // čte cookie → request-time, bez platné session redirect na login
  const [settings, participants] = await Promise.all([getSettings(), listParticipantsForAdmin()]);

  const drawn = Boolean(settings.drawn_at);
  const unsent = participants.filter((p) => !p.email_sent_at).length;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-red-800">🎅 Secret Santa · Admin</h1>
        <form action={logout}>
          <button className="text-sm text-gray-500 underline hover:text-gray-800">Odhlásit</button>
        </form>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Step
          n={1}
          title="Přihlášky"
          status={settings.registration_open ? "Otevřené" : "Uzavřené"}
          ok={!settings.registration_open}
        >
          {settings.registration_open ? (
            <ActionButton
              action={setRegistrationOpen.bind(null, false)}
              label="Uzavřít přihlášky"
              confirmText="Uzavřít přihlášky? Na homepage už se nikdo nepřihlásí."
            />
          ) : (
            <ActionButton
              action={setRegistrationOpen.bind(null, true)}
              label="Znovu otevřít"
              variant="secondary"
              disabled={drawn}
            />
          )}
        </Step>

        <Step
          n={2}
          title="Losování"
          status={drawn ? `Proběhlo ${formatDate(settings.drawn_at!)}` : "Neproběhlo"}
          ok={drawn}
        >
          {drawn ? (
            <ActionButton
              action={resetDraw}
              label="Zrušit losování"
              variant="danger"
              confirmText="Opravdu zrušit losování? Všechna přiřazení se smažou a kdo už email dostal, uvidí po novém losování jiné jméno."
            />
          ) : (
            <ActionButton
              action={drawPairs}
              label="Vylosovat"
              pendingLabel="Losuji…"
              disabled={settings.registration_open || participants.length < 3}
              confirmText={`Vylosovat dvojice pro ${participants.length} účastníků?`}
            />
          )}
          {!drawn && settings.registration_open && (
            <p className="text-xs text-gray-500">Nejdřív uzavři přihlášky.</p>
          )}
          {!drawn && !settings.registration_open && participants.length < 3 && (
            <p className="text-xs text-gray-500">Potřeba aspoň 3 účastníci.</p>
          )}
        </Step>

        <Step
          n={3}
          title="Emaily"
          status={drawn ? `Neodesláno: ${unsent}` : "Čeká na losování"}
          ok={drawn && unsent === 0}
        >
          <ActionButton
            action={sendPendingEmails}
            label={`Rozeslat (${drawn ? unsent : 0})`}
            pendingLabel="Odesílám…"
            disabled={!drawn || unsent === 0}
            confirmText={`Rozeslat email ${unsent} účastníkům?`}
          />
        </Step>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Přihlášení ({participants.length})</h2>
        {participants.length === 0 ? (
          <p className="text-sm text-gray-500">Zatím se nikdo nepřihlásil.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2">Jméno</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Přihlášen</th>
                  <th className="px-3 py-2">Email odeslán</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {participants.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2 font-medium">{p.name}</td>
                    <td className="px-3 py-2 text-gray-600">{p.email}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                      {p.email_sent_at ? `✅ ${formatDate(p.email_sent_at)}` : "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {drawn ? (
                        <ActionButton
                          action={resendEmail.bind(null, p.id)}
                          label={p.email_sent_at ? "Poslat znovu" : "Poslat"}
                          pendingLabel="Odesílám…"
                          variant="secondary"
                          small
                        />
                      ) : (
                        <ActionButton
                          action={deleteParticipant.bind(null, p.id)}
                          label="Smazat"
                          variant="danger"
                          small
                          confirmText={`Smazat ${p.name} ze Secret Santy?`}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-gray-500">
          Kdo komu dává, se tady záměrně nezobrazuje. Ví to jen databáze a každý účastník přes
          svůj odkaz v emailu.
        </p>
      </section>
    </div>
  );
}

function Step({
  n,
  title,
  status,
  ok,
  children,
}: {
  n: number;
  title: string;
  status: string;
  ok: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Krok {n}
        </div>
        <div className="font-semibold">{title}</div>
        <div className={`text-sm ${ok ? "text-green-700" : "text-gray-600"}`}>{status}</div>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
