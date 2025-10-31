/** <Link href="/x/[id]" as={`/x/${id}`}> → <Link href={`/x/${id}`}> */
export default function transformer(file, api) {
  const j = api.jscodeshift
  const r = j(file.source)
  let changed = false

  r.findJSXElements('Link').forEach(el => {
    const attrs = el.value.openingElement.attributes || []
    const hrefAttr = attrs.find(a => a.name?.name === 'href')
    const asAttr = attrs.find(a => a.name?.name === 'as')
    if (hrefAttr && asAttr) {
      hrefAttr.value = asAttr.value
      el.value.openingElement.attributes = attrs.filter(a => a !== asAttr)
      changed = true
    }
  })

  return changed ? r.toSource() : file.source
}