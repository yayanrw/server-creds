"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type Server = {
  id: string;
  name: string;
  description: string | null;
  public_ip: string | null;
  local_ip: string | null;
  tags: string[];
  created_at: string;
};

export async function getServers(): Promise<Server[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("servers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createServer(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const tags = (formData.get("tags") as string)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const { error } = await supabase.from("servers").insert({
    user_id: user.id,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    public_ip: (formData.get("public_ip") as string) || null,
    local_ip: (formData.get("local_ip") as string) || null,
    tags,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/servers");
  revalidatePath("/");
}

export async function updateServer(id: string, formData: FormData) {
  const supabase = await createClient();
  const tags = (formData.get("tags") as string)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const { error } = await supabase
    .from("servers")
    .update({
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      public_ip: (formData.get("public_ip") as string) || null,
      local_ip: (formData.get("local_ip") as string) || null,
      tags,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/servers");
  revalidatePath("/");
}

export async function deleteServer(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("servers").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/servers");
  revalidatePath("/");
}
