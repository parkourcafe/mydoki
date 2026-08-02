import { pseId } from "@/lib/support";

// "PSE Terdaftar" trust badge. Renders only once NEXT_PUBLIC_PSE_ID is set,
// i.e. after real registration with Komdigi. Links to the public registry.
export default function PseBadge({ className = "" }: { className?: string }) {
  const id = pseId();
  if (!id) return null;
  return (
    <a
      href="https://pse.komdigi.go.id/tdpse-detail"
      target="_blank"
      rel="noopener noreferrer"
      title={`PSE Terdaftar Kominfo — ${id}`}
      className={`inline-flex items-center gap-1.5 rounded-full border border-[#e8e0d5] bg-white px-3 py-1 text-xs font-medium text-[#5c5248] ${className}`}
    >
      <span aria-hidden="true">✅</span>
      <span>PSE Terdaftar</span>
    </a>
  );
}
