export function toCSV(rows: Record<string, string | number | boolean | null | undefined>[]) {
  if (!rows.length) return ""
  const headers = Object.keys(rows[0])
  const escape = (v: any) => {
    if (v == null) return ""
    const s = String(v).replace(/"/g, '""')
    if (/[",\n]/.test(s)) return `"${s}"`
    return s
  }
  const lines = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))]
  return lines.join("\n")
}
