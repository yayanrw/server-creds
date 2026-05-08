"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { revealCredential, deleteCredential, type Credential } from "@/actions/credentials";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, EyeOff, Copy, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const TYPE_LABELS: Record<string, string> = {
  ssh: "SSH",
  database: "Database",
  api_key: "API Key",
  env: "Env",
};

const TYPE_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ssh: "default",
  database: "secondary",
  api_key: "outline",
  env: "outline",
};

export function CredentialCard({ credential }: { credential: Credential }) {
  const [revealed, setRevealed] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleReveal() {
    if (revealed) {
      setRevealed(null);
      return;
    }
    startTransition(async () => {
      const value = await revealCredential(credential.id);
      setRevealed(value);
      setTimeout(() => setRevealed(null), 30000);
    });
  }

  function handleCopy() {
    startTransition(async () => {
      const value = await revealCredential(credential.id);
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard");
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteCredential(credential.id);
      toast.success("Deleted");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm truncate">{credential.name}</span>
            <Badge variant={TYPE_COLORS[credential.type]} className="text-xs shrink-0">
              {TYPE_LABELS[credential.type]}
            </Badge>
          </div>
          {credential.servers?.name && (
            <span className="text-xs text-muted-foreground">
              {credential.servers.name}
            </span>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" />}
          >
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/credentials/${credential.id}`)}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        {credential.username && (
          <span className="text-sm text-muted-foreground font-mono mr-2">
            {credential.username}
          </span>
        )}
        <code className="flex-1 text-sm font-mono bg-muted rounded px-2 py-1 truncate">
          {revealed ?? "••••••••••••"}
        </code>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={handleReveal}
          disabled={isPending}
          title={revealed ? "Hide" : "Show"}
        >
          {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={handleCopy}
          disabled={isPending}
          title="Copy"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
