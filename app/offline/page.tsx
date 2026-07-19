import OfflineMessage from "@/components/OfflineMessage";

export const metadata = {
  title: "Offline — doki.help",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f9f5f0] px-5 text-center text-[#2c2522]">
      <OfflineMessage />
    </main>
  );
}
