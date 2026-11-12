import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BearLogo, PageShell, Notice, Title } from "@/components/card";
import { GiftReveal } from "@/components/gift-reveal";
import { findRevealByToken } from "@/lib/db";

export const metadata: Metadata = {
  title: "Tvůj Secret Santa",
  referrer: "no-referrer", // token z URL neodejde v Referer hlavičce
};

export default function RevealPage({ params }: PageProps<"/reveal/[token]">) {
  return (
    <PageShell emojis>
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
        <BearLogo />
        <Title>Ahoj {result.name}!</Title>
        <Notice>Losování ještě neproběhlo. Až proběhne, dozvíš se to emailem. ⏳</Notice>
      </div>
    );
  }

  return <GiftReveal name={result.name} receiverName={result.receiverName} />;
}
