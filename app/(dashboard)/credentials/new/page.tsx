import { getServers } from "@/actions/servers";
import { CredentialForm } from "@/components/credential-form";

export default async function NewCredentialPage() {
  const servers = await getServers();
  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-xl font-semibold">Add Credential</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Values are encrypted with AES-256-GCM before storage.
        </p>
      </div>
      <CredentialForm servers={servers} />
    </div>
  );
}
