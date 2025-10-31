/** Replace AntD v4 `visible` prop with v5 `open` for Modal and Drawer */
export default function transformer(file, api) {
  const j = api.jscodeshift
  const r = j(file.source)
  let changed = false

  r.findJSXElements().forEach(p => {
    const name = p.value.openingElement.name
    const tag = name && name.name
    if (!['Modal','Drawer'].includes(tag)) return
    const attrs = p.value.openingElement.attributes || []
    const vis = attrs.find(a => a.name?.name === 'visible')
    if (vis) {
      vis.name.name = 'open'
      changed = true
    }
  })

  return changed ? r.toSource() : file.source
}