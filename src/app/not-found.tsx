import Link from "next/link";
import { PageShell } from "@/components/card";

export default function NotFound() {
  return (
    <PageShell>
      <div className="space-y-3 text-center">
        <div className="text-5xl">🎄</div>
        <h1 className="font-festive text-3xl text-red-700">Tady nic není</h1>
        <p className="text-sm text-gray-600">
          Odkaz je neplatný. Zkontroluj, že jsi ho z emailu zkopíroval/a celý.
        </p>
        <Link href="/" className="text-sm text-red-700 underline">
          Zpět na úvod
        </Link>
      </div>
    </PageShell>
  );
}
