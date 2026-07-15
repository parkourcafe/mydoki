import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/GuidePage";
import { guideMetadata, getGuide, GUIDE_KEYS } from "@/lib/guides";

export function generateStaticParams() {
  return GUIDE_KEYS.map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return params.then(({ slug }) => guideMetadata(slug));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getGuide(slug)) notFound();
  return <GuidePage slug={slug} />;
}
