"use client";

import { PageShell } from "@/components/card";

export default function Error({ retry }: { error: unknown; retry: () => void }) {
  return (
    <PageShell>
      <div className="space-y-4 text-center">
        <div className="text-5xl">🥶</div>
        <h1 className="text-xl font-bold text-red-800">Něco se pokazilo</h1>
        <p className="text-sm text-gray-600">
          Nepodařilo se načíst data. Zkus to prosím za chvíli znovu.
        </p>
        <button
          onClick={() => retry()}
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
        >
          Zkusit znovu
        </button>
      </div>
    </PageShell>
  );
}
