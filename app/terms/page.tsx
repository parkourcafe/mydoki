import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/lib/i18n";

const META_DESC = {
  ru: "Условия использования Doki.help — beta-сейфа семейных документов с напоминаниями и безопасным обменом. Не юридическая консультация.",
  en: "The terms for using Doki.help — a beta family document vault with reminders and secure sharing. Not legal advice.",
  id: "Ketentuan penggunaan Doki.help — brankas dokumen keluarga (beta) dengan pengingat dan berbagi aman. Bukan nasihat hukum.",
  uz: "Doki.help’dan foydalanish shartlari — eslatmalar va xavfsiz ulashishli oilaviy hujjatlar seyfi (beta). Yuridik maslahat emas.",
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: M[locale].title, description: META_DESC[locale] };
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{children}</p>;
}
function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-7 text-lg font-semibold text-slate-900">{children}</h2>;
}

const M = {
  ru: {
    back: "← На главную",
    title: "Пользовательское соглашение",
    lastUpdated: "Дата последнего обновления: 23.06.2026.",
    h1: "1. О сервисе",
    p1: "doki.help — сервис для хранения и упорядочивания документов семьи: удостоверения, медицинские данные, имущество, поездки и прочее, с напоминаниями о сроках и безопасной отправкой по ссылке. Сервис находится в активной разработке (бета) и предоставляется «как есть».",
    h2: "2. Регистрация и доступ",
    p2: "Для использования нужен аккаунт (email или вход через Google). Вы отвечаете за сохранность доступа к аккаунту. Рекомендуем включить двухфакторную аутентификацию.",
    h3: "3. Ваш контент",
    p3: "Вы загружаете документы и данные под свою ответственность и подтверждаете, что имеете право их хранить и обрабатывать (в том числе данные членов семьи — с их ведома, а в отношении детей — как законный представитель). Запрещено загружать незаконные материалы и чужие данные без основания.",
    h4: "4. AI-помощник и AI-юрист",
    p4: "Ответы ИИ-функций, включая AI-юриста, носят справочно-информационный характер и не являются юридической, медицинской или иной профессиональной консультацией. В важных вопросах обращайтесь к квалифицированному специалисту. Мы не гарантируем точность и полноту ответов ИИ.",
    h5: "5. Резервные копии",
    p5: "Сервис стремится обеспечивать сохранность данных, но не заменяет ваши собственные резервные копии важных оригиналов и документов.",
    h6: "6. Ограничение ответственности",
    p6: "Сервис предоставляется без гарантий бесперебойной работы. В пределах, допустимых законом, мы не несём ответственности за косвенные убытки, связанные с использованием или невозможностью использования Сервиса.",
    h7: "7. Изменения и прекращение",
    p7: "Мы можем изменять функциональность и условия, а также приостанавливать доступ при нарушении соглашения. Вы можете в любой момент удалить аккаунт.",
    h8: "8. Применимое право и контакты",
    p8a: "К отношениям применяется законодательство Российской Федерации. Вопросы — ",
    p8b: ".",
    footerA: "Регистрируясь в Сервисе, вы соглашаетесь с настоящими условиями и ",
    footerLink: "Политикой конфиденциальности",
    footerB: ".",
  },
  en: {
    back: "← Home",
    title: "Terms of Service",
    lastUpdated: "Last updated: 23.06.2026.",
    h1: "1. About the service",
    p1: "doki.help is a service for storing and organizing your family's documents: IDs, medical records, property, trips and more, with reminders about deadlines and secure sharing via link. The service is under active development (beta) and is provided «as is».",
    h2: "2. Registration and access",
    p2: "An account is required to use the service (email or sign-in via Google). You are responsible for keeping your account access secure. We recommend enabling two-factor authentication.",
    h3: "3. Your content",
    p3: "You upload documents and data at your own responsibility and confirm that you have the right to store and process them (including the data of family members — with their knowledge, and in respect of children — as their legal representative). Uploading illegal materials and other people's data without a legal basis is prohibited.",
    h4: "4. AI assistant and AI lawyer",
    p4: "Responses from AI features, including the AI lawyer, are for reference and informational purposes only and do not constitute legal, medical or any other professional advice. For important matters, consult a qualified specialist. We do not guarantee the accuracy and completeness of AI responses.",
    h5: "5. Backups",
    p5: "The service strives to ensure the safety of your data, but does not replace your own backups of important originals and documents.",
    h6: "6. Limitation of liability",
    p6: "The service is provided without any warranty of uninterrupted operation. To the extent permitted by law, we are not liable for indirect damages related to the use of or inability to use the Service.",
    h7: "7. Changes and termination",
    p7: "We may change the functionality and terms, as well as suspend access in the event of a breach of the agreement. You may delete your account at any time.",
    h8: "8. Applicable law and contacts",
    p8a: "These relations are governed by the legislation of the Russian Federation. Questions — ",
    p8b: ".",
    footerA: "By registering with the Service, you agree to these terms and the ",
    footerLink: "Privacy Policy",
    footerB: ".",
  },
  id: {
    back: "← Ke beranda",
    title: "Ketentuan Penggunaan",
    lastUpdated: "Tanggal pembaruan terakhir: 23.06.2026.",
    h1: "1. Tentang layanan",
    p1: "doki.help adalah layanan untuk menyimpan dan menata dokumen keluarga: identitas, data medis, properti, perjalanan, dan lainnya, dengan pengingat tenggat waktu dan pengiriman aman melalui tautan. Layanan ini sedang dalam pengembangan aktif (beta) dan disediakan «sebagaimana adanya».",
    h2: "2. Pendaftaran dan akses",
    p2: "Untuk menggunakan layanan diperlukan akun (email atau masuk melalui Google). Anda bertanggung jawab menjaga keamanan akses ke akun Anda. Kami menyarankan untuk mengaktifkan autentikasi dua faktor.",
    h3: "3. Konten Anda",
    p3: "Anda mengunggah dokumen dan data atas tanggung jawab Anda sendiri dan menyatakan bahwa Anda berhak menyimpan dan memprosesnya (termasuk data anggota keluarga — dengan sepengetahuan mereka, dan untuk anak-anak — sebagai wali yang sah). Dilarang mengunggah materi ilegal dan data orang lain tanpa dasar yang sah.",
    h4: "4. Asisten AI dan pengacara AI",
    p4: "Jawaban dari fitur AI, termasuk pengacara AI, bersifat referensi dan informasi saja serta bukan merupakan nasihat hukum, medis, atau nasihat profesional lainnya. Untuk hal-hal penting, hubungi spesialis yang berkualifikasi. Kami tidak menjamin keakuratan dan kelengkapan jawaban AI.",
    h5: "5. Cadangan data",
    p5: "Layanan berupaya menjaga keamanan data, tetapi tidak menggantikan cadangan Anda sendiri atas dokumen asli yang penting.",
    h6: "6. Pembatasan tanggung jawab",
    p6: "Layanan disediakan tanpa jaminan operasi yang tak terputus. Sejauh yang diizinkan oleh hukum, kami tidak bertanggung jawab atas kerugian tidak langsung yang terkait dengan penggunaan atau ketidakmampuan menggunakan Layanan.",
    h7: "7. Perubahan dan penghentian",
    p7: "Kami dapat mengubah fungsi dan ketentuan, serta menangguhkan akses jika terjadi pelanggaran perjanjian. Anda dapat menghapus akun kapan saja.",
    h8: "8. Hukum yang berlaku dan kontak",
    p8a: "Hubungan ini diatur oleh peraturan perundang-undangan Federasi Rusia. Pertanyaan — ",
    p8b: ".",
    footerA: "Dengan mendaftar di Layanan, Anda menyetujui ketentuan ini dan ",
    footerLink: "Kebijakan Privasi",
    footerB: ".",
  },
  uz: {
    back: "← Bosh sahifaga",
    title: "Foydalanish shartlari",
    lastUpdated: "Oxirgi yangilanish sanasi: 23.06.2026.",
    h1: "1. Xizmat haqida",
    p1: "doki.help — oila hujjatlarini saqlash va tartibga solish uchun xizmat: guvohnomalar, tibbiy maʼlumotlar, mulk, sayohatlar va boshqalar, muddatlar haqida eslatmalar va havola orqali xavfsiz yuborish bilan. Xizmat faol ishlab chiqilmoqda (beta) va «qanday boʻlsa, shundayligicha» taqdim etiladi.",
    h2: "2. Roʻyxatdan oʻtish va kirish",
    p2: "Foydalanish uchun hisob qaydnomasi kerak (email yoki Google orqali kirish). Hisob qaydnomangizga kirishni saqlash uchun siz javobgarsiz. Ikki bosqichli autentifikatsiyani yoqishni tavsiya qilamiz.",
    h3: "3. Sizning kontentingiz",
    p3: "Siz hujjatlar va maʼlumotlarni oʻz javobgarligingiz ostida yuklaysiz va ularni saqlash hamda qayta ishlash huquqiga ega ekanligingizni tasdiqlaysiz (jumladan, oila aʼzolarining maʼlumotlari — ularning xabari bilan, bolalarga nisbatan esa — qonuniy vakil sifatida). Noqonuniy materiallar va asossiz ravishda begona maʼlumotlarni yuklash taqiqlanadi.",
    h4: "4. AI-yordamchi va AI-yurist",
    p4: "AI funksiyalarining, jumladan AI-yuristning javoblari maʼlumot-axborot xarakteriga ega boʻlib, yuridik, tibbiy yoki boshqa professional maslahat hisoblanmaydi. Muhim masalalarda malakali mutaxassisga murojaat qiling. Biz AI javoblarining aniqligi va toʻliqligini kafolatlamaymiz.",
    h5: "5. Zaxira nusxalar",
    p5: "Xizmat maʼlumotlar xavfsizligini taʼminlashga intiladi, lekin muhim asl nusxalar va hujjatlarning oʻz zaxira nusxalaringizni almashtirmaydi.",
    h6: "6. Javobgarlikni cheklash",
    p6: "Xizmat uzluksiz ishlash kafolatisiz taqdim etiladi. Qonun ruxsat etgan doirada biz Xizmatdan foydalanish yoki foydalana olmaslik bilan bogʻliq bilvosita zararlar uchun javobgar emasmiz.",
    h7: "7. Oʻzgartirishlar va toʻxtatish",
    p7: "Biz funksionallik va shartlarni oʻzgartirishimiz, shuningdek, kelishuv buzilganda kirishni toʻxtatib turishimiz mumkin. Siz istalgan vaqtda hisob qaydnomangizni oʻchirib tashlashingiz mumkin.",
    h8: "8. Qoʻllaniladigan huquq va aloqa",
    p8a: "Ushbu munosabatlarga Rossiya Federatsiyasi qonunchiligi qoʻllaniladi. Savollar — ",
    p8b: ".",
    footerA: "Xizmatda roʻyxatdan oʻtish orqali siz ushbu shartlarga va ",
    footerLink: "Maxfiylik siyosatiga",
    footerB: " rozilik bildirasiz.",
  },
} as const;

export default async function TermsPage() {
  const locale = await getLocale();
  const t = M[locale];
  return (
    <main className="min-h-screen bg-[#f9f5f0] px-5 py-12 text-slate-800">
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#e8e0d5] bg-white p-7 sm:p-10">
        <Link href="/" className="text-sm text-[#b85c38] hover:underline">
          {t.back}
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          {t.title}
        </h1>
        <P>{t.lastUpdated}</P>

        <H>{t.h1}</H>
        <P>{t.p1}</P>

        <H>{t.h2}</H>
        <P>{t.p2}</P>

        <H>{t.h3}</H>
        <P>{t.p3}</P>

        <H>{t.h4}</H>
        <P>{t.p4}</P>

        <H>{t.h5}</H>
        <P>{t.p5}</P>

        <H>{t.h6}</H>
        <P>{t.p6}</P>

        <H>{t.h7}</H>
        <P>{t.p7}</P>

        <H>{t.h8}</H>
        <P>
          {t.p8a}
          <a href="mailto:support@doki.help" className="text-[#b85c38] hover:underline">
            support@doki.help
          </a>
          {t.p8b}
        </P>

        <p className="mt-8 border-t border-slate-100 pt-4 text-xs text-slate-400">
          {t.footerA}
          <Link href="/privacy" className="text-[#b85c38] hover:underline">
            {t.footerLink}
          </Link>
          {t.footerB}
        </p>
      </div>
    </main>
  );
}
