// Path prefixes where real user/candidate data renders into the DOM — third-
// party analytics (Yandex Metrika, PostHog autocapture) must never run here,
// consent or not. Superset of the robots.txt PRIVATE list (app/robots.txt/route.ts):
// also covers token-gated public views that render real document/candidate
// content (/apply, /s, /pkg, /portfolio, /invite, /delegate, /verify) and the
// employer dashboard (/employer), which robots.txt doesn't need to disallow
// but analytics must still avoid.
const PRIVATE_PREFIXES = [
  "/my",
  "/employer",
  "/apply",
  "/pkg",
  "/portfolio",
  "/s/",
  "/invite/",
  "/delegate/",
  "/verify/",
  "/saved",
  "/offline",
  "/auth",
  "/login",
  "/signup",
  "/reset-password",
];

/** True if `pathname` (may include a /ru /en /id /uz locale prefix) is private. */
export function isPrivatePath(pathname: string): boolean {
  const unprefixed = pathname.replace(/^\/(ru|en|id|uz)(?=\/|$)/, "") || "/";
  return PRIVATE_PREFIXES.some((raw) => {
    const base = raw.endsWith("/") ? raw.slice(0, -1) : raw;
    return unprefixed === base || unprefixed.startsWith(`${base}/`);
  });
}
