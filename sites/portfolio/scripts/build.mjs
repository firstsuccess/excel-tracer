import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pagePath = resolve(projectRoot, "dist/index.html");
const templatePath = resolve(projectRoot, "worker/index.js");
const manifestPath = resolve(projectRoot, ".openai/hosting.json");
const outputPath = resolve(projectRoot, "dist/server/index.js");
const outputManifestPath = resolve(projectRoot, "dist/.openai/hosting.json");

const [page, template] = await Promise.all([
  readFile(pagePath, "utf8"),
  readFile(templatePath, "utf8"),
]);
const marker = 'const pageTemplate = "__PAGE_TEMPLATE__";';
if (!template.includes(marker)) {
  throw new Error("Worker page template marker is missing");
}
const worker = template.replace(
  marker,
  `const pageTemplate = ${JSON.stringify(page)};`,
);

await mkdir(resolve(projectRoot, "dist/server"), { recursive: true });
await mkdir(resolve(projectRoot, "dist/.openai"), { recursive: true });
await writeFile(outputPath, worker);
await copyFile(manifestPath, outputManifestPath);
console.log("Built Worker output");
