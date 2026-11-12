import type { Metadata } from "next";
import { BearLogo, PageShell } from "@/components/card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin · Secret Santa" };

export default function AdminLoginPage() {
  return (
    <PageShell>
      <div className="mb-5 text-center">
        <BearLogo size={56} />
        <h1 className="mt-2 font-festive text-3xl text-red-700">Admin</h1>
      </div>
      <LoginForm />
    </PageShell>
  );
}
