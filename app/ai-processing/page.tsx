import type { Metadata } from "next";
import TrustPage from "@/components/TrustPage";
import { trustMetadata } from "@/lib/trust";

const SLUG = "ai-processing";

export function generateMetadata(): Promise<Metadata> {
  return trustMetadata(SLUG);
}

export default function Page() {
  return <TrustPage slug={SLUG} />;
}
