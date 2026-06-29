import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ChecklistPage from "@/components/ChecklistPage";
import { checklistMetadata, getChecklist, CHECKLIST_KEYS } from "@/lib/checklists";

export function generateStaticParams() {
  return CHECKLIST_KEYS.map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return params.then(({ slug }) => checklistMetadata(slug));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getChecklist(slug)) notFound();
  return <ChecklistPage slug={slug} />;
}
