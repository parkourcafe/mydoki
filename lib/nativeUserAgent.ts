// The shipped SwiftUI wrapper and the Capacitor wrapper use different
// User-Agent suffixes. Keep both so server-side App Store behavior also works
// for builds that are already in TestFlight or review.
export const NATIVE_UA_MARKERS = ["dokiNativeApp", "DokiHelpIOS/"] as const;

export const NATIVE_UA_MARKER = NATIVE_UA_MARKERS[0];

export function isNativeUserAgent(userAgent: string): boolean {
  return NATIVE_UA_MARKERS.some((marker) => userAgent.includes(marker));
}
