export default async function handler(req, res) {
  const csvContent = `Blog URL,Author Name,Email,Contact Page,Found At
https://example.typepad.com,Test Author,test@example.com,https://example.typepad.com/contact,2024-08-29`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="typepad-leads.csv"');
  res.status(200).send(csvContent);
}
