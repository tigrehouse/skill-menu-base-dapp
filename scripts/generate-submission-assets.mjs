import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(new URL("..", import.meta.url).pathname);
const outDir = join(root, "base-submission");
const W = 1284;
const H = 2778;

const c = {
  bg: "#fbf6ec",
  card: "#fffdf7",
  paper: "#fbf6ec",
  ink: "#1f2430",
  coral: "#ff6361",
  teal: "#2bb7b0",
  yellow: "#ffd166",
  pale: "#dff4ee",
};

function esc(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function wrap(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function frame(content) {
  return `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${c.bg}"/>
    <path d="M0 360H1284M0 720H1284M0 1080H1284M0 1440H1284M0 1800H1284M0 2160H1284M0 2520H1284" stroke="rgba(31,36,48,0.08)" stroke-width="4"/>
    <path d="M96 0V2778M456 0V2778M816 0V2778M1176 0V2778" stroke="rgba(31,36,48,0.07)" stroke-width="4"/>
    <circle cx="170" cy="190" r="245" fill="${c.coral}" opacity="0.18"/>
    <circle cx="1130" cy="250" r="260" fill="${c.teal}" opacity="0.18"/>
    ${content}
  </svg>`;
}

function titleBlock(title, subtitle) {
  return `
    <text x="72" y="126" font-family="Courier New, monospace" font-size="32" font-weight="900" fill="${c.teal}">SKILL MENU</text>
    <text x="72" y="238" font-family="Arial, sans-serif" font-size="82" font-weight="900" fill="${c.ink}">${esc(title)}</text>
    <text x="78" y="304" font-family="Arial, sans-serif" font-size="32" font-weight="800" fill="#2b7f7a">${esc(subtitle)}</text>
  `;
}

function skillCard(x, y, skill, price, delivery, details) {
  const lines = wrap(details, 34).slice(0, 5);
  return `
    <rect x="${x}" y="${y}" width="1060" height="1040" rx="28" fill="${c.card}" stroke="${c.ink}" stroke-width="6"/>
    <rect x="${x + 966}" y="${y}" width="94" height="1040" rx="28" fill="${c.teal}"/>
    <rect x="${x + 815}" y="${y + 70}" width="150" height="150" rx="24" fill="${c.coral}" stroke="${c.ink}" stroke-width="5"/>
    <text x="${x + 58}" y="${y + 102}" font-family="Courier New, monospace" font-size="25" font-weight="900" fill="#2b7f7a">SERVICE CARD</text>
    <text x="${x + 58}" y="${y + 220}" font-family="Arial, sans-serif" font-size="80" font-weight="900" fill="${c.ink}">${esc(skill)}</text>
    <rect x="${x + 58}" y="${y + 316}" width="300" height="138" rx="18" fill="${c.ink}"/>
    <text x="${x + 86}" y="${y + 372}" font-family="Courier New, monospace" font-size="22" font-weight="900" fill="${c.yellow}">PRICE</text>
    <text x="${x + 86}" y="${y + 430}" font-family="Arial, sans-serif" font-size="42" font-weight="900" fill="white">${esc(price)}</text>
    <rect x="${x + 386}" y="${y + 316}" width="300" height="138" rx="18" fill="${c.yellow}" stroke="${c.ink}" stroke-width="4"/>
    <text x="${x + 414}" y="${y + 372}" font-family="Courier New, monospace" font-size="22" font-weight="900" fill="#6f5200">DELIVERY</text>
    <text x="${x + 414}" y="${y + 430}" font-family="Arial, sans-serif" font-size="42" font-weight="900" fill="${c.ink}">${esc(delivery)}</text>
    <rect x="${x + 58}" y="${y + 540}" width="900" height="320" rx="18" fill="${c.paper}" stroke="${c.ink}" stroke-width="4"/>
    <text x="${x + 90}" y="${y + 604}" font-family="Courier New, monospace" font-size="22" font-weight="900" fill="${c.coral}">DETAILS</text>
    ${lines.map((line, i) => `<text x="${x + 90}" y="${y + 668 + i * 44}" font-family="Arial, sans-serif" font-size="32" font-weight="800" fill="${c.ink}">${esc(line)}</text>`).join("")}
    <rect x="${x + 58}" y="${y + 930}" width="900" height="76" rx="18" fill="${c.ink}"/>
    <text x="${x + 90}" y="${y + 980}" font-family="Courier New, monospace" font-size="23" font-weight="900" fill="${c.yellow}">CREATOR WALLET + TIMESTAMP STORED ON BASE</text>
  `;
}

function feature(x, y, title, body, fill) {
  return `
    <rect x="${x}" y="${y}" width="540" height="220" rx="22" fill="${fill}" stroke="${c.ink}" stroke-width="5"/>
    <text x="${x + 34}" y="${y + 78}" font-family="Arial, sans-serif" font-size="38" font-weight="900" fill="${c.ink}">${esc(title)}</text>
    ${wrap(body, 30).slice(0, 3).map((line, i) => `<text x="${x + 34}" y="${y + 132 + i * 34}" font-family="Arial, sans-serif" font-size="27" font-weight="800" fill="#2b7f7a">${esc(line)}</text>`).join("")}
  `;
}

function screenshot1() {
  return frame(`
    ${titleBlock("List what you do.", "Publish a creator service card on Base.")}
    ${skillCard(112, 460, "Mini app polish review", "0.01 ETH", "24h", "I review your Base mini app screen, find confusing flows, and send a short fix list for mobile polish.")}
    ${feature(72, 1640, "Service card", "Skill, price, delivery, and details.", c.card)}
    ${feature(672, 1640, "On Base", "Creator wallet and timestamp stay public.", c.pale)}
  `);
}

function screenshot2() {
  return frame(`
    ${titleBlock("A tiny creator menu.", "Make services easy to scan and verify.")}
    ${feature(72, 390, "Skill ID", "Reload a published service by number.", c.yellow)}
    ${feature(672, 390, "Price note", "Show the starting price clearly.", c.card)}
    ${skillCard(112, 730, "Landing page copy pass", "0.02 ETH", "2-3 days", "I rewrite your headline, one screen of copy, and CTA text so the app explains itself faster.")}
  `);
}

function screenshot3() {
  return frame(`
    ${titleBlock("For builders and creators.", "A simple way to show what you can deliver.")}
    ${skillCard(112, 430, "Base App submit kit", "Custom", "This week", "I prepare app name, tagline, description, screenshots, and a final launch checklist for Base.dev submission.")}
    ${feature(72, 1650, "BaseScan link", "Open the transaction after publishing.", c.pale)}
    ${feature(672, 1650, "Mobile first", "Built for quick browsing in Base App.", c.yellow)}
  `);
}

function iconSvg() {
  return `
  <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="${c.bg}"/>
    <rect x="132" y="132" width="760" height="760" rx="72" fill="${c.card}" stroke="${c.ink}" stroke-width="28"/>
    <rect x="748" y="132" width="144" height="760" rx="72" fill="${c.teal}"/>
    <rect x="260" y="300" width="430" height="58" rx="29" fill="${c.ink}"/>
    <rect x="260" y="456" width="330" height="58" rx="29" fill="${c.coral}"/>
    <rect x="260" y="612" width="430" height="58" rx="29" fill="${c.yellow}"/>
  </svg>`;
}

function thumbnailSvg() {
  return `
  <svg width="1910" height="1000" viewBox="0 0 1910 1000" xmlns="http://www.w3.org/2000/svg">
    <rect width="1910" height="1000" fill="${c.bg}"/>
    <text x="96" y="150" font-family="Arial, sans-serif" font-size="112" font-weight="900" fill="${c.ink}">Skill Menu</text>
    <text x="104" y="250" font-family="Arial, sans-serif" font-size="42" font-weight="800" fill="#2b7f7a">Publish creator service cards on Base.</text>
    ${feature(106, 370, "Creator service", "Skill, price, delivery.", c.card)}
    ${feature(106, 635, "Onchain card", "Wallet and timestamp saved.", c.pale)}
    ${skillCard(760, 244, "Mini app polish review", "0.01 ETH", "24h", "I review your Base mini app screen, find confusing flows, and send a short fix list for mobile polish.")}
  </svg>`;
}

async function writePng(name, svg, width = W, height = H) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg)).resize(width, height).png({ compressionLevel: 9 }).toFile(file);
  return file;
}

async function writeJpg(name, svg, width, height) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg)).resize(width, height).jpeg({ quality: 88, mozjpeg: true }).toFile(file);
  return file;
}

await mkdir(outDir, { recursive: true });

const files = [
  await writeJpg("app-icon.jpg", iconSvg(), 1024, 1024),
  await writeJpg("app-thumbnail.jpg", thumbnailSvg(), 1910, 1000),
  await writePng("screenshot-1.png", screenshot1()),
  await writePng("screenshot-2.png", screenshot2()),
  await writePng("screenshot-3.png", screenshot3()),
];

await writeFile(join(outDir, "asset-manifest.json"), JSON.stringify({ generatedAt: new Date().toISOString(), files }, null, 2), "utf8");
await writeFile(
  join(outDir, "submission-copy.md"),
  [
    "# Skill Menu",
    "",
    "App Name: Skill Menu",
    "Tagline: List what you do",
    "Description: Publish a creator service card with skill, price, delivery, wallet, and timestamp on Base.",
    "",
    "Domain: https://skill-menu.vercel.app",
    "",
    "Assets:",
    "- app-icon.jpg",
    "- app-thumbnail.jpg",
    "- screenshot-1.png",
    "- screenshot-2.png",
    "- screenshot-3.png",
  ].join("\n"),
  "utf8",
);

for (const file of files) console.log(file);
