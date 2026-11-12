"use client";

import { useActionState } from "react";
import { register, type RegisterState } from "./actions";
import { Notice } from "@/components/card";
import { EMAIL_DOMAIN, isCompanyEmail } from "@/lib/email";

const initial: RegisterState = { status: "idle" };

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, initial);

  if (state.status === "success") {
    return (
      <Notice tone="success">
        Hotovo, {state.name}, jsi v losování! 🎉 Až proběhne, přijde ti email s odkazem, kde
        uvidíš, koho obdarováváš.
      </Notice>
    );
  }

  const values = state.status === "error" ? state : undefined;

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Jméno</span>
        <input
          name="name"
          required
          maxLength={100}
          autoComplete="name"
          defaultValue={values?.name}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
          placeholder="Jan Novák"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Firemní email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={values?.email}
          onChange={(e) => {
            // Vlastní hláška prohlížeče místo atributu pattern; prázdné pole řeší `required`.
            const value = e.currentTarget.value;
            e.currentTarget.setCustomValidity(
              value === "" || isCompanyEmail(value)
                ? ""
                : `Použij firemní email končící na ${EMAIL_DOMAIN}`,
            );
          }}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
          placeholder="jmeno@codingbear.com"
        />
      </label>

      {state.status === "error" && <Notice tone="error">{state.message}</Notice>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-red-700 px-4 py-2.5 font-semibold text-white hover:bg-red-800 disabled:opacity-60"
      >
        {pending ? "Přihlašuji…" : "Přihlásit se do medvědího Secret Santy"}
      </button>
    </form>
  );
}
