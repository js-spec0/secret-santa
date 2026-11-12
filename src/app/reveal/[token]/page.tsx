import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageShell, Notice } from "@/components/card";
import { findRevealByToken } from "@/lib/db";

export const metadata: Metadata = {
  title: "Tvůj Secret Santa",
  referrer: "no-referrer", // token z URL neodejde v Referer hlavičce
};

export default function RevealPage({ params }: PageProps<"/reveal/[token]">) {
  return (
    <PageShell>
      <Suspense fallback={<p className="text-center text-sm text-gray-500">Načítám…</p>}>
        <Reveal params={params} />
      </Suspense>
    </PageShell>
  );
}

async function Reveal({ params }: { params: PageProps<"/reveal/[token]">["params"] }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{32,}$/.test(token)) notFound();

  const result = await findRevealByToken(token);
  if (!result) notFound();

  if (!result.receiverName) {
    return (
      <div className="space-y-4 text-center">
        <div className="text-5xl">⏳</div>
        <h1 className="text-xl font-bold text-red-800">Ahoj {result.name}!</h1>
        <Notice>Losování ještě neproběhlo. Až proběhne, dozvíš se to emailem.</Notice>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center">
      <div className="text-5xl">🎁</div>
      <p className="text-gray-600">Ahoj {result.name}, letos obdarováváš:</p>
      <p className="text-3xl font-bold text-red-800">{result.receiverName}</p>
      <p className="text-sm text-gray-500">Psst… nikomu to neprozraď. 🤫</p>
    </div>
  );
}
