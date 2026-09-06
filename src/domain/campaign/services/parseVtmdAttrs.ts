export type VtmdAttrs = Record<string, string>

export function parseVtmdAttrs(raw: string): VtmdAttrs {
  const attrs: VtmdAttrs = {}
  const re = /([\w-]+)=(?:"([^"]*)"|([\w.]+))/g
  let m: RegExpExecArray | null
  while ((m = re.exec(raw)) !== null) {
    attrs[m[1]!] = m[2] !== undefined ? m[2] : (m[3] ?? '')
  }
  return attrs
}
