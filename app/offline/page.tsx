export const metadata = { title: "Офлайн — doki.help" };

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f9f5f0] px-5 text-center text-[#2c2522]">
      <div className="max-w-sm">
        <div className="mb-3 text-5xl">🔌</div>
        <h1 className="text-xl font-semibold">Нет соединения</h1>
        <p className="mt-2 text-sm text-[#5c5248]">
          Сейчас нет интернета. Документы хранятся в облаке — откройте приложение
          снова, когда появится сеть.
        </p>
        <p className="mt-4 text-sm text-[#8a7c6d]">
          No connection · Tidak ada koneksi · Aloqa yoʻq
        </p>
      </div>
    </main>
  );
}
