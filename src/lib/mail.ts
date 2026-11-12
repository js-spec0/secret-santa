import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

export function appUrl(): string {
  const explicit = process.env.APP_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/** Otevře jedno SMTP spojení na Gmail (Google Workspace) pro celé rozesílání. */
export function createTransport(): Transporter {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!user || !pass) throw new Error("Chybí SMTP_USER nebo SMTP_PASSWORD v env proměnných.");
  const port = Number(process.env.SMTP_PORT ?? 465);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user, pass },
    pool: true,
    maxConnections: 1,
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

export async function sendRevealEmail(
  transport: Transporter,
  to: { name: string; email: string; token: string },
) {
  const link = `${appUrl()}/reveal/${to.token}`;
  const name = escapeHtml(to.name);
  // Jméno obdarovaného v emailu záměrně není – jen odkaz.
  await transport.sendMail({
    from: process.env.EMAIL_FROM ?? process.env.SMTP_USER,
    to: `"${to.name.replace(/"/g, "")}" <${to.email}>`,
    subject: "🎅 Secret Santa: losování proběhlo!",
    text: `Ahoj ${to.name},\n\nlosování Secret Santy proběhlo! Koho obdarováváš, uvidíš tady:\n${link}\n\nOdkaz nikomu nepřeposílej, je jen tvůj.\n\n🎄`,
    html: `<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#1f2937">
  <p>Ahoj ${name},</p>
  <p>losování Secret Santy proběhlo! Koho obdarováváš, uvidíš po kliknutí na tlačítko:</p>
  <p><a href="${link}" style="display:inline-block;background:#b91c1c;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Zobrazit, koho obdarovávám</a></p>
  <p style="font-size:13px;color:#6b7280">Odkaz nikomu nepřeposílej, je jen tvůj.</p>
  <p>🎄</p>
</div>`,
  });
}
