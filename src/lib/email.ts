// Sdílené pro klienta (formulář) i server (server action), ať se pravidla nerozejdou.

export const EMAIL_DOMAIN = "@codingbear.com";

const COMPANY_EMAIL = /^[^@\s]+@codingbear\.com$/;

/** Ořízne mezery a převede na malá písmena, tak se email i ukládá. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isCompanyEmail(email: string): boolean {
  return COMPANY_EMAIL.test(normalizeEmail(email));
}
