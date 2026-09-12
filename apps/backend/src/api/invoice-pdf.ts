const escapePdf = (value: unknown) =>
  String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");

export function createInvoicePdf(order: any): Buffer {
  const lines = [
    ["PETBOXNEST", 20],
    [`Invoice / Receipt for order #${order.display_id}`, 14],
    [
      `Order date: ${new Date(order.created_at).toISOString().slice(0, 10)}`,
      10,
    ],
    [`Customer: ${order.email}`, 10],
    ["", 10],
    ["Items", 12],
    ...(order.items || []).map((item: any) => [
      `${item.title}  x ${item.quantity}  ${Number(item.unit_price || 0).toFixed(2)} ${String(order.currency_code).toUpperCase()}`,
      10,
    ]),
    ["", 10],
    [
      `Subtotal: ${Number(order.subtotal || 0).toFixed(2)} ${String(order.currency_code).toUpperCase()}`,
      10,
    ],
    [
      `Shipping: ${Number(order.shipping_total || 0).toFixed(2)} ${String(order.currency_code).toUpperCase()}`,
      10,
    ],
    [
      `Tax: ${Number(order.tax_total || 0).toFixed(2)} ${String(order.currency_code).toUpperCase()}`,
      10,
    ],
    [
      `Total: ${Number(order.total || 0).toFixed(2)} ${String(order.currency_code).toUpperCase()}`,
      13,
    ],
  ] as Array<[string, number]>;

  let y = 780;
  const commands = lines
    .map(([line, size]) => {
      const command = `BT /F1 ${size} Tf 54 ${y} Td (${escapePdf(line)}) Tj ET`;
      y -= size + 10;
      return command;
    })
    .join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(commands)} >>\nstream\n${commands}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf);
}
