"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCredential, updateCredential, type CredentialType, type Credential } from "@/actions/credentials";
import { type Server } from "@/actions/servers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const TYPE_LABELS: Record<CredentialType, string> = {
  ssh: "SSH",
  database: "Database",
  api_key: "API Key",
  env: "Environment Variables",
};

export function CredentialForm({
  credential,
  servers,
}: {
  credential?: Credential;
  servers: Server[];
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        if (credential) {
          await updateCredential(credential.id, formData);
          toast.success("Credential updated");
        } else {
          await createCredential(formData);
          toast.success("Credential saved");
        }
        router.push("/");
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  const type = credential?.type;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select name="type" defaultValue={type ?? "ssh"} disabled={!!credential}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(TYPE_LABELS) as CredentialType[]).map((t) => (
              <SelectItem key={t} value={t}>
                {TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Label</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. prod-db-password"
          defaultValue={credential?.name}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="server_id">Server (optional)</Label>
        <Select name="server_id" defaultValue={credential?.server_id ?? ""}>
          <SelectTrigger>
            <SelectValue placeholder="No server" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No server</SelectItem>
            {servers.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username (optional)</Label>
        <Input
          id="username"
          name="username"
          placeholder="e.g. root, admin"
          defaultValue={credential?.username ?? ""}
        />
      </div>

      {(!type || type === "database") && (
        <>
          <div className="space-y-2">
            <Label htmlFor="host">Host (optional)</Label>
            <Input
              id="host"
              name="host"
              placeholder="e.g. db.example.com"
              defaultValue={credential?.metadata?.host ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="port">Port (optional)</Label>
            <Input
              id="port"
              name="port"
              placeholder="e.g. 5432"
              defaultValue={credential?.metadata?.port ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="database">Database name (optional)</Label>
            <Input
              id="database"
              name="database"
              placeholder="e.g. myapp_production"
              defaultValue={credential?.metadata?.database ?? ""}
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="value">
          {credential ? "New value (leave blank to keep current)" : "Value"}
        </Label>
        {type === "env" ? (
          <Textarea
            id="value"
            name="value"
            placeholder={"KEY=value\nANOTHER_KEY=value"}
            rows={6}
            required={!credential}
            className="font-mono text-sm"
          />
        ) : (
          <Input
            id="value"
            name="value"
            type="password"
            placeholder={credential ? "••••••••" : "Enter secret value"}
            required={!credential}
          />
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : credential ? "Update" : "Save credential"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
