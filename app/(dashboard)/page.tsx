import { getCredentials } from "@/actions/credentials";
import { getServers } from "@/actions/servers";
import { CredentialCard } from "@/components/credential-card";
import { Badge } from "@/components/ui/badge";

export default async function CredentialsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; server?: string }>;
}) {
  const { type, server } = await searchParams;
  const [credentials, servers] = await Promise.all([
    getCredentials(server),
    getServers(),
  ]);

  const filtered = type
    ? credentials.filter((c) => c.type === type)
    : credentials;

  const types = ["ssh", "database", "api_key", "env"] as const;
  const typeLabels = { ssh: "SSH", database: "Database", api_key: "API Key", env: "Env" };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold">Credentials</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {credentials.length} stored credential{credentials.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <a href="/">
          <Badge variant={!type ? "default" : "outline"} className="cursor-pointer">
            All
          </Badge>
        </a>
        {types.map((t) => (
          <a key={t} href={`/?type=${t}`}>
            <Badge variant={type === t ? "default" : "outline"} className="cursor-pointer">
              {typeLabels[t]}
            </Badge>
          </a>
        ))}
      </div>

      {servers.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {servers.map((s) => (
            <a key={s.id} href={`/?server=${s.id}`}>
              <Badge variant={server === s.id ? "secondary" : "outline"} className="cursor-pointer">
                {s.name}
              </Badge>
            </a>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No credentials found.</p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((cred) => (
            <CredentialCard key={cred.id} credential={cred} />
          ))}
        </div>
      )}
    </div>
  );
}
