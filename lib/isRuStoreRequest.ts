import "server-only";
import { headers } from "next/headers";
import {
  isMedicalFeaturesDisabledUserAgent,
  isRuStoreUserAgent,
} from "./nativeUserAgent";

export async function isRuStoreRequest(): Promise<boolean> {
  const userAgent = (await headers()).get("user-agent") || "";
  return isRuStoreUserAgent(userAgent);
}

export async function isMedicalFeaturesDisabledRequest(): Promise<boolean> {
  const userAgent = (await headers()).get("user-agent") || "";
  return isMedicalFeaturesDisabledUserAgent(userAgent);
}
