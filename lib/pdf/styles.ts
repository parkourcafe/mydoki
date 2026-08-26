import { StyleSheet } from "@react-pdf/renderer";

/** Общая типографика документов. Цвета — из брендовой палитры Tailwind. */
export const BRAND = "#b85c38";
export const INK = "#1f2937";
export const MUTED = "#6b7280";
export const LINE = "#e5e7eb";

export const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 44,
    fontFamily: "Roboto",
    fontSize: 10,
    lineHeight: 1.45,
    color: INK,
  },
  name: { fontSize: 20, fontWeight: 700 },
  headline: { fontSize: 11, color: BRAND, marginTop: 2 },
  contactLine: { fontSize: 9.5, color: MUTED, marginTop: 4 },
  rule: { borderBottomWidth: 1, borderBottomColor: LINE, marginTop: 12, marginBottom: 12 },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1,
    color: MUTED,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  section: { marginBottom: 14 },
  entry: { marginBottom: 8 },
  entryTitle: { fontSize: 10.5, fontWeight: 700 },
  entryMeta: { fontSize: 9, color: MUTED, marginTop: 1 },
  body: { marginTop: 2 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  chip: {
    fontSize: 9,
    color: INK,
    backgroundColor: "#f3f4f6",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  label: { color: MUTED, width: 130 },
  value: { flex: 1 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 44,
    right: 44,
    fontSize: 8,
    color: MUTED,
    borderTopWidth: 1,
    borderTopColor: LINE,
    paddingTop: 6,
  },
  letterTitle: { fontSize: 15, fontWeight: 700, marginBottom: 10 },
  paragraph: { marginTop: 8 },
});
