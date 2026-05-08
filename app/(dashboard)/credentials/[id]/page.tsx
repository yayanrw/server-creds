import { notFound } from "next/navigation";
import { getCredentials } from "@/actions/credentials";
import { getServers } from "@/actions/servers";
import { CredentialForm } from "@/components/credential-form";

export default async function EditCredentialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [credentials, servers] = await Promise.all([
    getCredentials(),
    getServers(),
  ]);

  const credential = credentials.find((c) => c.id === id);
  if (!credential) notFound();

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-xl font-semibold">Edit Credential</h1>
        <p className="text-sm text-muted-foreground mt-1">{credential.name}</p>
      </div>
      <CredentialForm credential={credential} servers={servers} />
    </div>
  );
}
