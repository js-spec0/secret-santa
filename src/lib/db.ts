import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Participant = {
  id: string;
  name: string;
  email: string;
  token: string;
  receiver_id: string | null;
  email_sent_at: string | null;
  created_at: string;
};

export type Settings = {
  registration_open: boolean;
  drawn_at: string | null;
};

let client: SupabaseClient | null = null;

/** Supabase klient se service role / secret klíčem. Používat jen na serveru. */
export function db(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Chybí SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY v env proměnných.");
    }
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export async function getSettings(): Promise<Settings> {
  const { data, error } = await db()
    .from("settings")
    .select("registration_open, drawn_at")
    .eq("id", 1)
    .single();
  if (error) throw error;
  return data;
}

export async function countParticipants(): Promise<number> {
  const { count, error } = await db()
    .from("participants")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

/** Seznam pro admin: záměrně BEZ tokenu a BEZ receiver_id, ať admin nevidí, kdo komu dává. */
export async function listParticipantsForAdmin() {
  const { data, error } = await db()
    .from("participants")
    .select("id, name, email, email_sent_at, created_at")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as Pick<Participant, "id" | "name" | "email" | "email_sent_at" | "created_at">[];
}

/** Pro stránku /reveal/[token]: jméno účastníka a jméno toho, koho obdarovává. */
export async function findRevealByToken(token: string) {
  const { data: me, error } = await db()
    .from("participants")
    .select("name, receiver_id")
    .eq("token", token)
    .maybeSingle();
  if (error) throw error;
  if (!me) return null;
  if (!me.receiver_id) return { name: me.name as string, receiverName: null };

  const { data: receiver, error: receiverError } = await db()
    .from("participants")
    .select("name")
    .eq("id", me.receiver_id)
    .single();
  if (receiverError) throw receiverError;
  return { name: me.name as string, receiverName: receiver.name as string };
}
