import "server-only";
import { headers } from "next/headers";
import { isRuStoreUserAgent } from "./nativeUserAgent";

export async function isRuStoreRequest(): Promise<boolean> {
  const userAgent = (await headers()).get("user-agent") || "";
  return isRuStoreUserAgent(userAgent);
}
