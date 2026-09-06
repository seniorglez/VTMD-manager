export function resolveRelativePath(currentPath: string, href: string): string {
  if (href.startsWith('/')) return href
  const dir = currentPath.split('/').slice(0, -1).join('/')
  const segments = (dir + '/' + href).split('/')
  const resolved: string[] = []
  for (const seg of segments) {
    if (seg === '..') resolved.pop()
    else if (seg !== '.') resolved.push(seg)
  }
  return resolved.join('/')
}
