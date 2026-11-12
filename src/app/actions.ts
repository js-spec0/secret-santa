"use server";

import { randomBytes } from "node:crypto";
import { refresh } from "next/cache";
import { db, getSettings } from "@/lib/db";
import { EMAIL_DOMAIN, isCompanyEmail, normalizeEmail } from "@/lib/email";

export type RegisterState =
  | { status: "idle" }
  | { status: "success"; name: string }
  | { status: "error"; message: string; name?: string; email?: string };

export async function register(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim().replace(/\s+/g, " ");
  const email = normalizeEmail(String(formData.get("email") ?? ""));

  if (!name || name.length > 100) {
    return { status: "error", message: "Vyplň prosím své jméno.", name, email };
  }
  if (!isCompanyEmail(email)) {
    return {
      status: "error",
      message: `Přihlásit se lze jen firemním emailem končícím na ${EMAIL_DOMAIN}.`,
      name,
      email,
    };
  }

  const settings = await getSettings();
  if (!settings.registration_open) {
    return { status: "error", message: "Přihlášky jsou už uzavřené." };
  }

  const token = randomBytes(32).toString("base64url");
  const { error } = await db().from("participants").insert({ name, email, token });

  if (error) {
    if (error.code === "23505") {
      return { status: "error", message: "Tenhle email už je přihlášený. 🎁", name, email };
    }
    console.error("register failed", error);
    return { status: "error", message: "Něco se pokazilo, zkus to prosím znovu.", name, email };
  }

  refresh();
  return { status: "success", name };
}
