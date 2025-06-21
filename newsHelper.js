export function categorizeNews(title, desc) {
  const tags = [];

  const text = (title + " " + desc).toLowerCase();

  if (text.includes("fomc") || text.includes("fed") || text.includes("interest rate")) {
    tags.push("🏦 Monetary Policy");
  }
  if (text.includes("inflation") || text.includes("cpi")) {
    tags.push("📈 Inflation");
  }
  if (text.includes("unemployment") || text.includes("non-farm") || text.includes("nfp") || text.includes("jobs")) {
    tags.push("💼 Employment Data");
  }
  if (text.includes("gdp") || text.includes("growth")) {
    tags.push("📊 GDP / Economic Growth");
  }
  if (text.includes("ecb") || text.includes("bank of england")) {
    tags.push("🇪🇺 Central Banks (EU/UK)");
  }

  return tags.length ? tags.join(", ") : "📌 General Economic Update";
}

export function generateDetailedSummary(title, desc, source) {
  return `📰 *${title}*

📌 *Topik*: ${categorizeNews(title, desc)}

📄 *Keterangan Lengkap:*
${desc.trim()}

🔗 *Sumber*: ${source}`;
}
