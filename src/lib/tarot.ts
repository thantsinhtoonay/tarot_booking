import { promises as fs } from "node:fs";
import path from "node:path";

export type TarotCardOption = {
  filename: string;
  label: string;
  url: string;
};

const tarotDirectory = path.join(process.cwd(), "public", "images", "tarot");
const imageExtension = /\.(?:jpg|jpeg|png|webp)$/i;
const majorArcana = [
  "Fool", "Magician", "High Priestess", "Empress", "Emperor", "Hierophant", "Lovers", "Chariot", "Strength", "Hermit", "Wheel of Fortune", "Justice", "Hanged Man", "Death", "Temperance", "Devil", "Tower", "Star", "Moon", "Sun", "Judgement", "World",
];

function titleCase(value: string) {
  return value.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export function tarotCardLabel(filename: string) {
  const stem = filename.replace(imageExtension, "");
  const match = stem.match(/^(\d+)-(.+)$/);
  if (!match) return titleCase(stem);

  const number = Number(match[1]);
  const parts = match[2].split("-");
  const first = parts.shift() ?? "";
  if (number <= 21) return `The ${majorArcana[number]}`;
  const suit = titleCase(parts.join("-"));
  if (first === "ace") return `Ace of ${suit}`;
  if (/^\d+$/.test(first)) return `${Number(first)} of ${suit}`;
  return `${titleCase(first)} of ${suit}`;
}

export async function listTarotCards(): Promise<TarotCardOption[]> {
  const entries = await fs.readdir(tarotDirectory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && imageExtension.test(entry.name))
    .map((entry) => ({
      filename: entry.name,
      label: tarotCardLabel(entry.name),
      url: `/images/tarot/${encodeURIComponent(entry.name)}`,
    }))
    .sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true }));
}
