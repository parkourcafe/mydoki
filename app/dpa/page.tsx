import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/lib/i18n";
import { SUPPORT_EMAIL, SECURITY_EMAIL } from "@/lib/support";
import { POLICY_VERSION } from "@/lib/policy";

// One-page Data Processing Agreement template for pilot employers.
// Controller = employer, Processor = Doki (doki.help operator).
// ⚠ Draft pending review by an Indonesian lawyer before signing (Compliance-gate).
// noindex: shared on request with pilots, not for public SEO until legal sign-off.

type Clause = { h: string; p: string };
type Dict = {
  home: string;
  title: string;
  intro: string;
  draftNote: string;
  clauses: Clause[];
  requestTitle: string;
  request: string;
};

const EN: Dict = {
  home: "← Back to home",
  title: "Data Processing Agreement (DPA) — pilot template",
  intro:
    "This template governs processing of personal data that the Employer (Controller) makes available to doki.help (Processor) when collecting documents from candidates through the Service.",
  draftNote:
    "Draft template for pilot employers, pending review by Indonesian counsel before signature. Request a countersigned copy from us.",
  clauses: [
    { h: "1. Parties and roles", p: "The Employer is the data Controller and determines the purposes of processing. The doki.help operator is the Processor and processes personal data only on the Controller's documented instructions." },
    { h: "2. Subject matter and duration", p: "Processing covers candidate documents and application data submitted via the Employer's vacancy links, for as long as the Employer's account is active or until deletion is requested." },
    { h: "3. Nature and purpose", p: "Collecting, storing, organizing and making available candidate documents so the Employer can review application completeness. No automated decision-making that produces legal effects." },
    { h: "4. Categories of data and data subjects", p: "Data subjects: job candidates. Data: identity documents, certificates, contact details, and any sensitive data (e.g. medical, financial) a candidate chooses to upload." },
    { h: "5. Processor obligations", p: "Confidentiality of personnel; appropriate technical and organizational security measures (RLS isolation, private storage, signed links, encryption in transit); assistance with data-subject requests and with the Controller's own compliance obligations." },
    { h: "6. Sub-processors", p: "The Processor uses infrastructure sub-processors (e.g. Supabase for hosting/database/storage; an email/SMS provider; an AI provider only where the Controller or candidate enables recognition). A current list is available on request." },
    { h: "7. Cross-border transfer", p: "Data may be stored on servers located outside Indonesia. Transfers follow Arts. 55–56 of UU PDP 27/2022, with disclosure and consent obtained at the point of upload." },
    { h: "8. Personal-data breach", p: "The Processor notifies the Controller without undue delay and supports notification to affected data subjects and the authority within 3×24 hours, as required by UU PDP. Security contact: " + SECURITY_EMAIL + "." },
    { h: "9. Return and deletion", p: "On termination, the Processor deletes or returns personal data at the Controller's choice, save where retention is legally required. Candidates may request deletion of their own data at any time." },
    { h: "10. Audit and governing law", p: "The Processor makes available information necessary to demonstrate compliance. Governing law and dispute resolution to be finalized with counsel (UU 24/2009 language requirements considered)." },
  ],
  requestTitle: "Request a signed copy",
  request: "Email us and we'll send a countersigned DPA for your pilot:",
};

const ID: Dict = {
  home: "← Kembali ke beranda",
  title: "Perjanjian Pemrosesan Data (DPA) — templat pilot",
  intro:
    "Templat ini mengatur pemrosesan data pribadi yang disediakan Perusahaan (Pengendali) kepada doki.help (Pemroses) saat mengumpulkan dokumen dari kandidat melalui Layanan.",
  draftNote:
    "Templat draf untuk perusahaan pilot, menunggu tinjauan penasihat hukum Indonesia sebelum ditandatangani. Minta salinan yang sudah ditandatangani kepada kami.",
  clauses: [
    { h: "1. Para pihak dan peran", p: "Perusahaan adalah Pengendali data dan menentukan tujuan pemrosesan. Operator doki.help adalah Pemroses dan hanya memproses data pribadi atas instruksi terdokumentasi dari Pengendali." },
    { h: "2. Pokok dan jangka waktu", p: "Pemrosesan mencakup dokumen kandidat dan data lamaran yang dikirim melalui tautan lowongan Perusahaan, selama akun Perusahaan aktif atau sampai penghapusan diminta." },
    { h: "3. Sifat dan tujuan", p: "Mengumpulkan, menyimpan, menata, dan menyediakan dokumen kandidat agar Perusahaan dapat meninjau kelengkapan lamaran. Tanpa pengambilan keputusan otomatis yang berakibat hukum." },
    { h: "4. Kategori data dan subjek data", p: "Subjek data: kandidat kerja. Data: dokumen identitas, sertifikat, detail kontak, serta data sensitif (mis. medis, keuangan) yang dipilih kandidat untuk diunggah." },
    { h: "5. Kewajiban Pemroses", p: "Kerahasiaan personel; langkah keamanan teknis dan organisasi yang sesuai (isolasi RLS, penyimpanan privat, tautan bertanda tangan, enkripsi saat transit); bantuan atas permintaan subjek data dan kewajiban kepatuhan Pengendali." },
    { h: "6. Sub-pemroses", p: "Pemroses menggunakan sub-pemroses infrastruktur (mis. Supabase untuk hosting/basis data/penyimpanan; penyedia email/SMS; penyedia AI hanya bila Pengendali atau kandidat mengaktifkan pengenalan). Daftar terkini tersedia atas permintaan." },
    { h: "7. Transfer lintas negara", p: "Data dapat disimpan di server di luar Indonesia. Transfer mengikuti Pasal 55–56 UU PDP 27/2022, dengan pengungkapan dan persetujuan yang diperoleh saat pengunggahan." },
    { h: "8. Pelanggaran data pribadi", p: "Pemroses memberi tahu Pengendali tanpa penundaan yang tidak wajar dan mendukung pemberitahuan kepada subjek data terdampak serta otoritas dalam waktu 3×24 jam, sesuai UU PDP. Kontak keamanan: " + SECURITY_EMAIL + "." },
    { h: "9. Pengembalian dan penghapusan", p: "Saat berakhir, Pemroses menghapus atau mengembalikan data pribadi sesuai pilihan Pengendali, kecuali bila penyimpanan diwajibkan hukum. Kandidat dapat meminta penghapusan datanya sendiri kapan saja." },
    { h: "10. Audit dan hukum yang berlaku", p: "Pemroses menyediakan informasi yang diperlukan untuk membuktikan kepatuhan. Hukum yang berlaku dan penyelesaian sengketa akan difinalisasi bersama penasihat hukum (mempertimbangkan ketentuan bahasa UU 24/2009)." },
  ],
  requestTitle: "Minta salinan bertanda tangan",
  request: "Email kami dan kami akan mengirim DPA yang sudah ditandatangani untuk pilot Anda:",
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = locale === "id" ? ID : EN;
  return {
    title: `${t.title} — doki.help`,
    description: t.intro,
    robots: { index: false, follow: false },
  };
}

export default async function DpaPage() {
  const locale = await getLocale();
  const t = locale === "id" ? ID : EN;
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-5">
      <Link href="/" className="text-sm text-[#8a7c6d] hover:underline">
        {t.home}
      </Link>
      <h1 className="heading-font mt-3 text-2xl text-[#2c2522] sm:text-3xl">{t.title}</h1>
      <p className="mt-2 text-xs text-[#8a7c6d]">v{POLICY_VERSION}</p>
      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {t.draftNote}
      </div>
      <p className="mt-5 text-[#5c5248]">{t.intro}</p>

      <div className="mt-6 space-y-5">
        {t.clauses.map((c) => (
          <div key={c.h}>
            <h2 className="font-semibold text-[#2c2522]">{c.h}</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#5c5248]">{c.p}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-[#e8e0d5] bg-[#fdfaf5] p-5">
        <div className="font-semibold text-[#2c2522]">{t.requestTitle}</div>
        <p className="mt-1 text-sm text-[#5c5248]">
          {t.request}{" "}
          <a href={`mailto:${SUPPORT_EMAIL}?subject=DPA`} className="text-[#b85c38] hover:underline">
            {SUPPORT_EMAIL}
          </a>
        </p>
      </div>
    </main>
  );
}
