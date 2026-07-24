// The store wrappers use distinct suffixes so the server can keep their
// locale, navigation and privacy behavior independent.
export const RUSTORE_UA_MARKER = "DokiHelpAndroid/RU/";
export const GOOGLE_PLAY_UA_MARKER = "DokiHelpAndroid/GP/";

export const NATIVE_UA_MARKERS = [
  "dokiNativeApp",
  "DokiHelpIOS/",
  RUSTORE_UA_MARKER,
  GOOGLE_PLAY_UA_MARKER,
] as const;

export const NATIVE_UA_MARKER = NATIVE_UA_MARKERS[0];

export function isNativeUserAgent(userAgent: string): boolean {
  return NATIVE_UA_MARKERS.some((marker) => userAgent.includes(marker));
}

export function isRuStoreUserAgent(userAgent: string): boolean {
  return userAgent.includes(RUSTORE_UA_MARKER);
}

export function isGooglePlayUserAgent(userAgent: string): boolean {
  return userAgent.includes(GOOGLE_PLAY_UA_MARKER);
}

export function isMedicalFeaturesDisabledUserAgent(userAgent: string): boolean {
  return isRuStoreUserAgent(userAgent) || isGooglePlayUserAgent(userAgent);
}
