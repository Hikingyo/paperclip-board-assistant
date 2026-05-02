import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const manifestPath = path.join(rootDir, "marketplace", "plugin-bundle.json");

async function stagePath(relativePath, destinationRoot, stagedFiles) {
  const sourcePath = path.join(rootDir, relativePath);
  const destinationPath = path.join(destinationRoot, relativePath);

  await mkdir(path.dirname(destinationPath), { recursive: true });
  await cp(sourcePath, destinationPath, { recursive: true });
  stagedFiles.push(relativePath);
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const outputDir = path.join(rootDir, "dist", "marketplace", manifest.plugin.id);
const stagedFiles = [];

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

await stagePath("marketplace/plugin-bundle.json", outputDir, stagedFiles);
await stagePath(manifest.components.mcp.package_manifest, outputDir, stagedFiles);
await stagePath(manifest.components.mcp.environment_example, outputDir, stagedFiles);
await stagePath(manifest.components.mcp.build_output, outputDir, stagedFiles);
await stagePath(manifest.components.agent.manifest, outputDir, stagedFiles);
await stagePath(manifest.components.agent.instructions, outputDir, stagedFiles);

for (const skillPath of manifest.components.skills) {
  await stagePath(skillPath, outputDir, stagedFiles);
}

for (const docPath of manifest.documentation) {
  await stagePath(docPath, outputDir, stagedFiles);
}

await writeFile(
  path.join(outputDir, "artifact-inventory.json"),
  JSON.stringify(
    {
      plugin: manifest.plugin,
      staged_at: new Date().toISOString(),
      files: stagedFiles,
    },
    null,
    2,
  ),
);
