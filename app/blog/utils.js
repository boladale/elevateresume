import fs from "fs";
import path from "path";

const contentDir = path.join(process.cwd(), "content");

export function getAllPosts() {
  if (!fs.existsSync(contentDir)) return [];

  const files = fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .reverse();

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(contentDir, file), "utf-8");
    const post = JSON.parse(raw);
    return { ...post, slug: file.replace(".json", "") };
  });
}

export function getPost(slug) {
  const filePath = path.join(contentDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return { ...JSON.parse(raw), slug };
}

export function getAllSlugs() {
  if (!fs.existsSync(contentDir)) return [];
  return fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}
