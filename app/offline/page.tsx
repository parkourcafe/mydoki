import Link from "next/link";

export const metadata = {
  title: "Офлайн — doki.help",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f9f5f0] px-5 text-center text-[#2c2522]">
      <div className="max-w-sm">
        <div className="mb-3 text-5xl">🔌</div>
        <h1 className="text-xl font-semibold">Нет соединения</h1>
        <p className="mt-2 text-sm text-[#5c5248]">
          Сейчас нет интернета. Документы, сохранённые офлайн, доступны без сети.
        </p>
        <Link
          href="/saved"
          prefetch
          className="mt-4 inline-block rounded-lg bg-[#b85c38] px-4 py-2 text-sm font-medium text-white"
        >
          📥 Открыть сохранённое офлайн
        </Link>
        <p className="mt-4 text-xs text-[#8a7c6d]">
          No connection · Tidak ada koneksi · Aloqa yoʻq
        </p>
      </div>
    </main>
  );
}
