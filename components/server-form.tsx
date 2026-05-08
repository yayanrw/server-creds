"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createServer, updateServer, type Server } from "@/actions/servers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ServerForm({
  server,
  onDone,
}: {
  server?: Server;
  onDone?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        if (server) {
          await updateServer(server.id, formData);
          toast.success("Server updated");
        } else {
          await createServer(formData);
          toast.success("Server added");
        }
        router.refresh();
        onDone?.();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Production DB"
          defaultValue={server?.name}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="public_ip">Public IP</Label>
        <Input
          id="public_ip"
          name="public_ip"
          placeholder="e.g. 203.0.113.1"
          defaultValue={server?.public_ip ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="local_ip">Local IP</Label>
        <Input
          id="local_ip"
          name="local_ip"
          placeholder="e.g. 192.168.1.10"
          defaultValue={server?.local_ip ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          placeholder="Optional note"
          defaultValue={server?.description ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          name="tags"
          placeholder="e.g. prod, web, ubuntu"
          defaultValue={server?.tags?.join(", ") ?? ""}
        />
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : server ? "Update" : "Add server"}
        </Button>
        {onDone && (
          <Button type="button" variant="outline" onClick={onDone} disabled={isPending}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
