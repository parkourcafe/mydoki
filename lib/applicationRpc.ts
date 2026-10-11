// Public apply-flow RPCs. Production revoked anon execute on these functions and
// renamed submit_application to submit_application_internal, so an anonymous
// visitor's own client can no longer call them. The server action runs them
// with the service-role client after its own Turnstile and IP checks; a
// database built from this repository's migrations still has only the old
// name, so the internal name falls back to it when PostgREST cannot find it.

type RpcResult = { data: unknown; error: { code?: string; message?: string } | null };
type RpcClient = { rpc: (fn: string, args: Record<string, unknown>) => PromiseLike<RpcResult> };

const FUNCTION_NOT_FOUND = "PGRST202";

export async function callApplicationRpc(
  clients: { admin: RpcClient | null; user: RpcClient },
  fn: "submit_application" | "precheck_application" | "increment_vacancy_views",
  args: Record<string, unknown>,
): Promise<RpcResult> {
  const { admin, user } = clients;
  if (!admin) return user.rpc(fn, args);
  if (fn === "submit_application") {
    const internal = await admin.rpc("submit_application_internal", args);
    if (internal.error?.code !== FUNCTION_NOT_FOUND) return internal;
  }
  return admin.rpc(fn, args);
}
