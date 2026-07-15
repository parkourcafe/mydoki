import type { Metadata } from "next";
import TrustPage from "@/components/TrustPage";
import { trustMetadata } from "@/lib/trust";

const SLUG = "data-deletion";

export function generateMetadata(): Promise<Metadata> {
  return trustMetadata(SLUG);
}

export default function Page() {
  return <TrustPage slug={SLUG} />;
}
