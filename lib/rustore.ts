const RESTRICTED_PREFIXES = [
  "/employer",
  "/my/applications",
  "/my/career",
  "/my/employment",
  "/my/freelance",
  "/my/legal",
  "/my/resume",
  "/my/work",
] as const;

export function isRuStoreRestrictedPath(pathname: string): boolean {
  if (
    RESTRICTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  ) {
    return true;
  }

  if (pathname === "/my/documents/category/medical") return true;
  return /^\/my\/members\/[^/]+\/health(?:\/|$)/.test(pathname);
}

export function isRuStoreRestrictedDocumentCategory(category: string): boolean {
  return category === "medical";
}

export function isMedicalDocumentCategory(category: string): boolean {
  return category === "medical";
}
