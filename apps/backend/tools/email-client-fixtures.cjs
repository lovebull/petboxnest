// Generate real-template samples without starting Medusa, reading .env, or sending mail.
// Run from anywhere: node apps/backend/tools/email-client-fixtures.cjs
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const { createRequire } = require('node:module')
const { createHash } = require('node:crypto')
const swc = require('@swc/core')
const React = require('react')
const { render, toPlainText } = require('@react-email/components')

const backend = path.resolve(__dirname, '..')
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'pbn-email-acceptance-'))
const cache = new Map()
function load(file) {
  file = path.resolve(file)
  if (cache.has(file)) return cache.get(file)
  const localRequire = createRequire(file)
  const mod = { exports: {} }
  const { code } = swc.transformSync(fs.readFileSync(file, 'utf8'), {
    jsc: { parser: { syntax: 'typescript', tsx: true }, target: 'es2022', transform: { react: { runtime: 'automatic' } } },
    module: { type: 'commonjs' },
  })
  new Function('require', 'module', 'exports', code)((id) => {
    if (!id.startsWith('.')) return localRequire(id)
    const base = path.resolve(path.dirname(file), id)
    const resolved = [base, `${base}.ts`, `${base}.tsx`].find(p => fs.existsSync(p) && fs.statSync(p).isFile())
    if (!resolved) throw new Error(`Missing fixture dependency: ${id}`)
    return load(resolved)
  }, mod, mod.exports)
  cache.set(file, mod.exports)
  return mod.exports
}

// Nonfunctional links avoid confirming subscriptions, resetting passwords or changing carts.
const link = (action) => `https://example.com/petboxnest-email-test/${action}?token=PREVIEW-ONLY`
const image = 'https://www.petboxnest.com/images/home/logo.png'
const date = '2026-11-06T15:00:00.000Z'
const items = [
  { id: 'fixture-1', title: 'Disposable litter box — long product name for email layout acceptance', quantity: 3, unit_price: 32.99, thumbnail: image },
  { id: 'fixture-2', title: 'Product without a thumbnail', quantity: 1, unit_price: 10, thumbnail: null },
]
const order = { id: 'order_PREVIEW_ONLY', display_id: 'TEST-1001', created_at: date, email: 'preview@example.com', customer: { first_name: 'Alex' }, currency_code: 'usd', total: 108.97, items }
const fixtures = [
  ['order-placed', { order }],
  ['admin-order-placed', { order, admin_url: 'https://example.com' }],
  ['shipment-created', { order, fulfillment: { shipped_at: date, labels: [{ tracking_number: 'TEST123456789', tracking_url: link('tracking') }, { tracking_number: 'TEST-NO-LINK', tracking_url: 'javascript:alert(1)' }] } }],
  ['payment-refunded', { order, payment: { currency_code: 'usd', refunds: [{ id: 'test-a', amount: 20, created_at: date }, { id: 'test-b', amount: 10, created_at: date }] } }],
  ['after-sales-code', { order, code: '123456' }],
  ['after-sales-update', { request: { request_number: 'TEST-RETURN-1001', status: 'awaiting_shipment', type: 'return', customer_message: 'TEST ONLY. Please review the instructions for your request. '.repeat(8) } }],
  ['password-reset', { reset_url: link('password-reset') }],
  ['email-verification', { verification_url: link('email-verification'), expires_at: date }],
  ['restock-available', { product_title: items[0].title, variant_title: 'Three boxes', thumbnail: image, product_url: link('product'), unsubscribe_url: link('unsubscribe') }],
  ['abandoned-cart', { items, currency_code: 'usd', total: 108.97, recovery_url: link('cart'), unsubscribe_url: link('unsubscribe'), expires_at: date }],
  ['restock-available', { product_title: 'Missing image example', product_url: link('product'), unsubscribe_url: link('unsubscribe') }, 'no-image'],
  ['payment-refunded', { order, payment: { refunds: [] } }, 'no-records'],
]

function base64(value) {
  return Buffer.from(value).toString('base64').match(/.{1,76}/g).join('\r\n')
}
const manifest = []
function save(name, html, text) {
  const boundary = `pbn_${name.replace(/[^a-z0-9]/gi, '_')}`
  const eml = [
    'From: PetBoxNest Preview <preview@example.com>',
    'To: Preview <preview@example.com>',
    `Subject: [TEST ONLY] PetBoxNest ${name}`,
    `Date: ${new Date(date).toUTCString()}`,
    `Message-ID: <${name}.${path.basename(output)}@example.com>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`, '',
    `--${boundary}`, 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', base64(text),
    `--${boundary}`, 'Content-Type: text/html; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', base64(html), `--${boundary}--`, '',
  ].join('\r\n')
  fs.writeFileSync(path.join(output, `${name}.html`), html)
  fs.writeFileSync(path.join(output, `${name}.eml`), eml)
  manifest.push({ name, htmlBytes: Buffer.byteLength(html), sha256: createHash('sha256').update(html).digest('hex'), clientResult: 'NOT_TESTED' })
}

async function main() {
  // Scope this preview-only setting to the generator process.
  process.env.STOREFRONT_URL = 'https://example.com'
  for (const [name, props, suffix] of fixtures) {
    const component = load(path.join(backend, 'src/modules/resend/emails', `${name}.tsx`)).default
    const html = await render(React.createElement(component, props))
    if (/href="javascript:/i.test(html)) throw new Error(`Unsafe sample link: ${name}`)
    save(`${name}${suffix ? `-${suffix}` : ''}`, html, toPlainText(html))
  }
  const newsletter = load(path.join(backend, '../cms/src/emails/newsletter-confirmation.ts'))
    .renderNewsletterConfirmation({ confirmUrl: link('newsletter-confirm'), unsubscribeUrl: link('newsletter-unsubscribe'), expiresAt: date })
  save('newsletter-confirmation', newsletter.html, newsletter.text)
  fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(`Generated ${manifest.length} HTML/EML sample pairs: ${output}`)
  console.log('Actual Gmail / Outlook / Apple Mail acceptance: NOT TESTED. No email sent.')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
