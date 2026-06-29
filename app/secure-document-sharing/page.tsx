import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { landingMetadata } from "@/lib/landings";

const SLUG = "secure-document-sharing";

export function generateMetadata(): Promise<Metadata> {
  return landingMetadata(SLUG);
}

export default function Page() {
  return <LandingPage slug={SLUG} />;
}
