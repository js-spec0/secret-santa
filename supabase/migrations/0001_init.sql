-- Secret Santa: schéma databáze.
-- Spusť celé v Supabase → SQL Editor (nebo `supabase db push`).

-- ---------------------------------------------------------------------------
-- Tabulky
-- ---------------------------------------------------------------------------

create table if not exists public.participants (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 1 and 100),
  email         text not null unique
                check (email = lower(email) and email ~ '^[^@\s]+@codingbear\.com$'),
  -- Náhodný token do odkazu v emailu (/reveal/<token>). Nikdy se nezobrazuje v adminu.
  token         text not null unique check (char_length(token) >= 32),
  -- Koho tento účastník obdarovává. UNIQUE = každý může být vylosován jen jednou.
  receiver_id   uuid unique references public.participants(id) on delete set null,
  email_sent_at timestamptz,
  created_at    timestamptz not null default now(),
  -- Nikdo nesmí obdarovávat sám sebe.
  constraint participants_no_self check (receiver_id is null or receiver_id <> id)
);

create table if not exists public.settings (
  id                int primary key default 1 check (id = 1),  -- vždy jen jeden řádek
  registration_open boolean not null default true,
  drawn_at          timestamptz
);

insert into public.settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Zabezpečení: RLS zapnuté a žádné policies → veřejný (anon) klíč nevidí nic.
-- Aplikace přistupuje jen ze serveru přes service role / secret klíč.
-- ---------------------------------------------------------------------------

alter table public.participants enable row level security;
alter table public.settings     enable row level security;

revoke all on public.participants, public.settings from anon, authenticated;
grant select, insert, update, delete on public.participants, public.settings to service_role;

-- ---------------------------------------------------------------------------
-- Losování: zamíchá účastníky a každý obdaruje dalšího v pořadí (poslední prvního).
-- Vznikne jeden kruh: nikdo nedostane sám sebe, každý je vylosován právě jednou
-- a nevzniknou dvojice A↔B. Vše proběhne v jedné transakci.
-- ---------------------------------------------------------------------------

create or replace function public.draw_pairs()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
  s public.settings%rowtype;
begin
  -- Zamkne nastavení, aby dvě souběžná losování nemohla proběhnout zároveň.
  select * into s from public.settings where id = 1 for update;

  if s.registration_open then
    raise exception 'REGISTRATION_OPEN';
  end if;
  if s.drawn_at is not null then
    raise exception 'ALREADY_DRAWN';
  end if;

  select count(*) into n from public.participants;
  if n < 3 then
    raise exception 'NOT_ENOUGH_PARTICIPANTS';
  end if;

  with shuffled as materialized (
    select id, row_number() over (order by random()) as rn
    from public.participants
  ),
  pairs as (
    select giver.id as giver_id, receiver.id as receiver_id
    from shuffled giver
    join shuffled receiver on receiver.rn = (giver.rn % n) + 1
  )
  update public.participants p
  set receiver_id = pairs.receiver_id
  from pairs
  where p.id = pairs.giver_id;

  update public.settings set drawn_at = now() where id = 1;
  return n;
end;
$$;

-- Zruší losování (a označení odeslaných emailů), aby šlo losovat znovu.
create or replace function public.reset_draw()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform 1 from public.settings where id = 1 for update;
  update public.participants set receiver_id = null, email_sent_at = null where true;
  update public.settings set drawn_at = null where id = 1;
end;
$$;

-- Funkce smí volat jen server (service role), ne veřejný klíč.
revoke all on function public.draw_pairs() from public, anon, authenticated;
revoke all on function public.reset_draw() from public, anon, authenticated;
grant execute on function public.draw_pairs() to service_role;
grant execute on function public.reset_draw() to service_role;
