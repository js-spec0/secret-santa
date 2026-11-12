import type { ReactNode } from "react";

export function PageShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <main className="flex flex-1 items-start justify-center px-4 py-12 sm:py-20">
      <div
        className={`w-full ${wide ? "max-w-3xl" : "max-w-md"} rounded-2xl border border-red-100 bg-white p-6 shadow-sm sm:p-8`}
      >
        {children}
      </div>
    </main>
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "error";
  children: ReactNode;
}) {
  const styles = {
    info: "border-amber-200 bg-amber-50 text-amber-900",
    success: "border-green-200 bg-green-50 text-green-900",
    error: "border-red-200 bg-red-50 text-red-900",
  }[tone];
  return <div className={`rounded-lg border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}
