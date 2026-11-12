import { Suspense } from "react";
import { connection } from "next/server";
import { BearLogo, PageShell, Notice, Title } from "@/components/card";
import { countParticipants, getSettings } from "@/lib/db";
import { RegisterForm } from "./register-form";

export default function Home() {
  return (
    <PageShell>
      <div className="mb-6 text-center">
        <BearLogo />
        <div className="mt-2">
          <Title>Secret Santa</Title>
        </div>
        <p className="mt-1 text-sm font-medium tracking-wide text-green-800">Coding Bear 🎄</p>
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
        losování. 🎁
      </Notice>
    );
  }

  return (
    <>
      {count > 0 && (
        <p className="mb-5 text-center">
          <span className="inline-block rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-800 ring-1 ring-green-200">
            🎁 Přihlášeno: {count}
          </span>
        </p>
      )}
      <RegisterForm />
    </>
  );
}
