# 🎅 Secret Santa · Coding Bear

Jednoduchá firemní appka na Secret Santu: přihláška na homepage, admin s losováním a rozesíláním emailů, každý účastník uvidí svého obdarovaného přes tajný odkaz.

**Stack:** Next.js 16 (App Router) · Supabase (Postgres) · Gmail SMTP (Google Workspace) přes nodemailer · Vercel

## Jak to funguje

| Stránka | Co dělá |
|---|---|
| `/` | Přihláška (jméno + email `@codingbear.com`). Po uzavření přihlášek ukáže „Přihlášky jsou uzavřené“. |
| `/admin` | Chráněno heslem. Postup: 1) uzavřít přihlášky, 2) vylosovat, 3) rozeslat emaily. Seznam přihlášených, mazání (před losováním), opětovné poslání emailu. |
| `/reveal/<token>` | Odkaz z emailu, ukáže, koho daný člověk obdarovává. Token je náhodný (32 bajtů), z ID se odvodit nedá. |

**Losování** probíhá v databázi (funkce `draw_pairs` v [migraci](supabase/migrations/0001_init.sql)): účastníci se náhodně zamíchají a každý obdaruje dalšího v pořadí, poslední prvního. Nikdo tak nedostane sám sebe, každý je vylosovaný právě jednou a nevzniknou dvojice A↔B. Pravidla navíc hlídají databázová omezení (`unique` a `check`), takže neplatné přiřazení se nedá uložit. Jsou potřeba aspoň 3 účastníci.

**Soukromí:** admin stránka nezobrazuje, kdo komu dává. Databáze má zapnuté RLS bez policies, takže veřejný klíč nevidí nic a vše jde přes server.

## Nastavení (jednorázově)

### 1. Supabase
1. Na [supabase.com](https://supabase.com) založ nový projekt (region nejlépe `Central EU (Frankfurt)`).
2. Otevři **SQL Editor**, vlož celý obsah [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) a spusť.
3. V **Project Settings → API** si zkopíruj *Project URL* (`SUPABASE_URL`) a v **API Keys** *secret* klíč (nebo legacy `service_role`) jako `SUPABASE_SERVICE_ROLE_KEY`.

> ⚠️ Free projekt se po 7 dnech bez aktivity uspí. Kdyby se stránka nenačítala, v Supabase dashboardu klikni na **Restore project**.

### 2. Gmail (Google Workspace) heslo aplikace
1. Na účtu, ze kterého budeš posílat, musí být zapnuté **dvoufázové ověření**.
2. Na [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) vytvoř heslo aplikace (např. „Secret Santa“). Pokud tam ta možnost chybí, má ji vypnutou Workspace admin.
3. 16znakové heslo (bez mezer) použij jako `SMTP_PASSWORD`.

> ⚠️ Odeslané emaily se uloží do tvé složky **Odeslané**, i s odkazy. Pokud nechceš vědět, kdo komu dává, **neotvírej je**. Po rozeslání je v Gmailu najdi podle předmětu `Secret Santa: losování proběhlo`, označ všechny a smaž, aniž bys je otevíral.

### 3. Lokální spuštění
```bash
cp .env.example .env.local   # a vyplň hodnoty
npm install
npm run dev
```
Pak otevři http://localhost:3000 (homepage) a http://localhost:3000/admin.

### 4. Nasazení na Vercel
1. Pushni repozitář na GitHub a na [vercel.com](https://vercel.com) ho importuj (*Add New → Project*).
2. V **Settings → Environment Variables** nastav všechny proměnné z `.env.example`. `APP_URL` nastav na finální adresu (např. `https://secret-santa-xyz.vercel.app`), protože se z ní skládají odkazy v emailech.
3. Deploy. Každý další push na `main` se nasadí sám.

## Průběh akce
1. Pošli kolegům odkaz na homepage, ať se přihlásí.
2. V `/admin` **uzavři přihlášky**.
3. Klikni na **Vylosovat**.
4. Klikni na **Rozeslat**. Komu se email nepovede odeslat, tomu ho můžeš poslat znovu z tabulky.
5. Hotovo! 🎁

Pokud je potřeba losovat znovu (např. se někdo odhlásil), použij **Zrušit losování**, uprav účastníky a vylosuj znovu. Kdo už email dostal, uvidí na stejném odkazu nové jméno, takže je mu potom dobré email poslat znovu.

## Struktura
```
supabase/migrations/0001_init.sql   tabulky, zabezpečení, funkce losování
src/lib/db.ts                       Supabase klient a dotazy (jen server)
src/lib/admin-auth.ts               admin heslo + podepsaná cookie
src/lib/mail.ts                     SMTP a šablona emailu
src/app/page.tsx, actions.ts        homepage a přihláška
src/app/admin/                      admin login, dashboard, server actions
src/app/reveal/[token]/page.tsx     stránka s výsledkem losování
```
