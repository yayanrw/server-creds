import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { KeyRound, Server, LogOut, Plus } from "lucide-react";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r flex flex-col p-4 gap-1 shrink-0">
        <div className="flex items-center gap-2 px-2 py-3 mb-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Server Creds</span>
        </div>
        <Separator className="mb-2" />
        <nav className="flex flex-col gap-1 flex-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-2 py-2 rounded-md text-sm hover:bg-accent transition-colors"
          >
            <KeyRound className="h-4 w-4" />
            Credentials
          </Link>
          <Link
            href="/servers"
            className="flex items-center gap-2 px-2 py-2 rounded-md text-sm hover:bg-accent transition-colors"
          >
            <Server className="h-4 w-4" />
            Servers
          </Link>
        </nav>
        <Separator className="my-2" />
        <div className="text-xs text-muted-foreground px-2 mb-1 truncate">
          {user.email}
        </div>
        <form action={signOut}>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </form>
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div />
          <Link href="/credentials/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add credential
            </Button>
          </Link>
        </div>
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
}
