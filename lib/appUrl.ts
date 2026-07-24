const PRODUCTION_APP_URL = "https://www.doki.help";

export function normalizeAppUrl(value?: string | null): string {
  const configured = value?.trim() || PRODUCTION_APP_URL;
  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(configured)
    ? configured
    : `https://${configured}`;

  try {
    const url = new URL(withProtocol);
    if (url.hostname === "doki.help" || url.hostname === "www.doki.help") {
      url.protocol = "https:";
      url.hostname = "www.doki.help";
    }
    url.search = "";
    url.hash = "";
    url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString().replace(/\/$/, "");
  } catch {
    return PRODUCTION_APP_URL;
  }
}

export const APP_URL = normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL);
