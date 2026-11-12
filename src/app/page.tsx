import { Suspense } from "react";
import { connection } from "next/server";
import { PageShell, Notice } from "@/components/card";
import { countParticipants, getSettings } from "@/lib/db";
import { RegisterForm } from "./register-form";

export default function Home() {
  return (
    <PageShell>
      <div className="mb-6 text-center">
        <div className="text-5xl">🎅</div>
        <h1 className="mt-3 text-2xl font-bold text-red-800">Secret Santa</h1>
        <p className="mt-1 text-sm text-gray-600">Coding Bear</p>
      </div>
      <Suspense fallback={<p className="text-center text-sm text-gray-500">Načítám…</p>}>
        <Registration />
      </Suspense>
    </PageShell>
  );
}

async function Registration() {
  await connection(); // vždy čerstvá data z DB, nic se nepředgeneruje při buildu
  const [settings, count] = await Promise.all([getSettings(), countParticipants()]);

  if (!settings.registration_open) {
    return (
      <Notice>
        Přihlášky jsou uzavřené. Pokud ses přihlásil/a, počkej na email s odkazem na výsledek
        losování. 🎄
      </Notice>
    );
  }

  return (
    <>
      <p className="mb-5 text-center text-sm text-gray-600">
        Zadej své jméno a firemní email. Až budou přihlášky uzavřené, losování ti přidělí kolegu,
        kterého obdarováváš.
        {count > 0 && (
          <span className="mt-1 block font-medium text-gray-800">Přihlášeno: {count}</span>
        )}
      </p>
      <RegisterForm />
    </>
  );
}
