"use client";

import { useActionState } from "react";
import { login } from "../actions";
import { Notice } from "@/components/card";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Heslo</span>
        <input
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
        />
      </label>
      {error && <Notice tone="error">{error}</Notice>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-red-700 px-4 py-2.5 font-semibold text-white hover:bg-red-800 disabled:opacity-60"
      >
        {pending ? "Přihlašuji…" : "Přihlásit"}
      </button>
    </form>
  );
}
