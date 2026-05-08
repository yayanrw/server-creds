"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { encrypt, decrypt } from "@/lib/crypto";

export type CredentialType = "ssh" | "database" | "api_key" | "env";

export type Credential = {
  id: string;
  server_id: string | null;
  type: CredentialType;
  name: string;
  username: string | null;
  metadata: Record<string, string>;
  created_at: string;
  servers?: { name: string } | null;
};

export async function getCredentials(serverId?: string): Promise<Credential[]> {
  const supabase = await createClient();
  let query = supabase
    .from("credentials")
    .select("id, server_id, type, name, username, metadata, created_at, servers(name)")
    .order("created_at", { ascending: false });

  if (serverId) query = query.eq("server_id", serverId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Credential[];
}

export async function revealCredential(id: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credentials")
    .select("encrypted_value, iv, auth_tag")
    .eq("id", id)
    .single();

  if (error || !data) throw new Error("Not found");
  return decrypt(data.encrypted_value, data.iv, data.auth_tag);
}

export async function createCredential(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const plainValue = formData.get("value") as string;
  const { encrypted_value, iv, auth_tag } = encrypt(plainValue);

  const metadata: Record<string, string> = {};
  const metaKeys = ["port", "database", "host"];
  for (const key of metaKeys) {
    const val = formData.get(key) as string;
    if (val) metadata[key] = val;
  }

  const serverId = formData.get("server_id") as string;

  const { error } = await supabase.from("credentials").insert({
    user_id: user.id,
    server_id: serverId || null,
    type: formData.get("type") as CredentialType,
    name: formData.get("name") as string,
    username: (formData.get("username") as string) || null,
    encrypted_value,
    iv,
    auth_tag,
    metadata,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function updateCredential(id: string, formData: FormData) {
  const supabase = await createClient();

  const updates: Record<string, unknown> = {
    name: formData.get("name") as string,
    username: (formData.get("username") as string) || null,
    server_id: (formData.get("server_id") as string) || null,
  };

  const plainValue = formData.get("value") as string;
  if (plainValue) {
    const { encrypted_value, iv, auth_tag } = encrypt(plainValue);
    updates.encrypted_value = encrypted_value;
    updates.iv = iv;
    updates.auth_tag = auth_tag;
  }

  const metadata: Record<string, string> = {};
  for (const key of ["port", "database", "host"]) {
    const val = formData.get(key) as string;
    if (val) metadata[key] = val;
  }
  updates.metadata = metadata;

  const { error } = await supabase
    .from("credentials")
    .update(updates)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath(`/credentials/${id}`);
}

export async function deleteCredential(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("credentials")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}
