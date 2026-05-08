"use client";

import { useEffect, useState, useTransition } from "react";
import { getServers, deleteServer, type Server } from "@/actions/servers";
import { ServerForm } from "@/components/server-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, Server as ServerIcon } from "lucide-react";
import { toast } from "sonner";

export default function ServersPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [editTarget, setEditTarget] = useState<Server | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function load() {
    startTransition(async () => {
      setServers(await getServers());
    });
  }

  useEffect(() => { load(); }, []);

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteServer(id);
      toast.success("Server deleted");
      load();
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Servers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Group credentials by server
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger render={<Button size="sm" className="gap-2" />}>
            <Plus className="h-4 w-4" />
            Add server
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add server</DialogTitle>
            </DialogHeader>
            <ServerForm onDone={() => { setAddOpen(false); load(); }} />
          </DialogContent>
        </Dialog>
      </div>

      {servers.length === 0 && !isPending && (
        <p className="text-sm text-muted-foreground">No servers yet.</p>
      )}

      <div className="grid gap-3">
        {servers.map((server) => (
          <Card key={server.id}>
            <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <ServerIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <CardTitle className="text-base">{server.name}</CardTitle>
                  {server.description && (
                    <CardDescription className="text-xs">
                      {server.description}
                    </CardDescription>
                  )}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Dialog
                  open={editTarget?.id === server.id}
                  onOpenChange={(open) => !open && setEditTarget(null)}
                >
                  <DialogTrigger
                    render={<Button variant="ghost" size="icon" className="h-7 w-7" />}
                    onClick={() => setEditTarget(server)}
                  >
                    <Pencil className="h-4 w-4" />
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit server</DialogTitle>
                    </DialogHeader>
                    <ServerForm
                      server={server}
                      onDone={() => { setEditTarget(null); load(); }}
                    />
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(server.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 text-sm">
              {server.public_ip && (
                <span className="text-muted-foreground">
                  Public: <code className="font-mono">{server.public_ip}</code>
                </span>
              )}
              {server.local_ip && (
                <span className="text-muted-foreground">
                  Local: <code className="font-mono">{server.local_ip}</code>
                </span>
              )}
              {server.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
