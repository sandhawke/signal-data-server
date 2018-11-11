const CSV = require('csv-string')
const H = require('escape-html-template-tag')
const N3 = require('n3')
const rdfkb = require('rdfkb')

const formats = []
module.exports = formats

formats.push({
  name: 'table',
  stringifier: data => {
    const out = []
    out.push('<table id="datatable" class="display">')
    out.push('  <thead>')
    out.push('    <tr>')
    for (const label of data.columnLabels) {
      out.push(H`      <th>${label}</th>`)
    }
    out.push('    </tr>')
    out.push('  </thead>')
    out.push('  <tbody>')
    for (const row of data) {
      out.push('    <tr>')
      for (const col of row) {
        out.push(H`      <td>${col}</td>`)
      }
      out.push('    </tr>')
    }
    out.push('  </tbody>')
    out.push('</table>')
    out.push(H.safe`
<script>
$(document).ready( function () {
    $('#datatable').DataTable();
})
</script>
`)
    return H.safe(out.join('\n'))
  },
  applicable: x => x.isRows
})

formats.push({
  name: 'json',
  stringifier: x => JSON.stringify(x, null, 2),
  type: 'application/json',
  applicable: () => true
})

formats.push({
  name: 'csv',
  stringifier: rows => {
    return CSV.stringify([rows.columnLabels].concat(rows))
  },
  type: 'text/csv',
  applicable: x => x.isRows
})

formats.push({
  name: 'turtle',
  stringifier: data => {
    // this should be exposed from rdfkb
    let out = 'n3 async error'
    const writer = N3.Writer({ format: 'trig', prefixes: rdfkb.defaultns });
    for (const q of data) writer.addQuad(q)
    writer.end((error, result) => { out = result })
    return out
  },
  type: 'text/turtle',
  applicable: x => x.isRDF
})


// Make formats addressible by name as well as number.  Sketchy, I know.
for (const format of formats) {
  formats[format.name] = format
}
