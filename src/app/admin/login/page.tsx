import type { Metadata } from "next";
import { PageShell } from "@/components/card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin · Secret Santa" };

export default function AdminLoginPage() {
  return (
    <PageShell>
      <h1 className="mb-5 text-xl font-bold text-red-800">🔒 Admin</h1>
      <LoginForm />
    </PageShell>
  );
}
