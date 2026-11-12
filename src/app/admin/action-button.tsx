"use client";

import { useState, useTransition } from "react";
import type { ActionResult } from "./actions";

const variants = {
  primary: "bg-red-700 text-white hover:bg-red-800",
  secondary: "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50",
  danger: "border border-red-300 bg-white text-red-700 hover:bg-red-50",
};

export function ActionButton({
  action,
  label,
  pendingLabel,
  confirmText,
  disabled,
  variant = "primary",
  small = false,
}: {
  action: () => Promise<ActionResult>;
  label: string;
  pendingLabel?: string;
  confirmText?: string;
  disabled?: boolean;
  variant?: keyof typeof variants;
  small?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={disabled || pending}
        onClick={() => {
          if (confirmText && !window.confirm(confirmText)) return;
          setResult(null);
          startTransition(async () => setResult(await action()));
        }}
        className={`rounded-lg font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
          small ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm"
        } ${variants[variant]}`}
      >
        {pending ? (pendingLabel ?? "Pracuji…") : label}
      </button>
      {result && (
        <span className={`text-xs ${result.ok ? "text-green-700" : "text-red-700"}`}>
          {result.message}
        </span>
      )}
    </span>
  );
}
