#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const repoRoot = path.join(__dirname, "..");
const apiDir = path.join(repoRoot, "api");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function packagePath() {
  return path.join(apiDir, "package.json");
}

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync(packagePath(), "utf8"));
  return packageJson.version;
}

function updatePackageVersion(newVersion) {
  const filePath = packagePath();
  const packageJson = JSON.parse(fs.readFileSync(filePath, "utf8"));
  packageJson.version = newVersion;
  fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + "\n");
  log(`✓ Updated api/package.json version to ${newVersion}`, "green");
}

function replaceRootLockVersion(lockText, oldVersion, newVersion) {
  const marker = '"dependencies"';
  const splitAt = lockText.indexOf(marker);
  if (splitAt === -1) {
    throw new Error("api/package-lock.json has no dependencies block");
  }

  const header = lockText.slice(0, splitAt);
  const rest = lockText.slice(splitAt);
  const needle = `"version": "${oldVersion}"`;
  const occurrences = header.split(needle).length - 1;
  if (occurrences !== 2) {
    throw new Error(
      `Expected 2 root version fields in api/package-lock.json, found ${occurrences}`
    );
  }

  return header.split(needle).join(`"version": "${newVersion}"`) + rest;
}

function updateLockfileVersion(oldVersion, newVersion) {
  const lockPath = path.join(apiDir, "package-lock.json");
  const lockText = fs.readFileSync(lockPath, "utf8");
  fs.writeFileSync(
    lockPath,
    replaceRootLockVersion(lockText, oldVersion, newVersion)
  );
  log(`✓ Updated api/package-lock.json version to ${newVersion}`, "green");
}

function replaceSwaggerVersion(source, newVersion) {
  const pattern = /(version:\s*')[^']+(')/;
  if (!pattern.test(source)) {
    throw new Error("api/src/swagger.ts has no version field");
  }
  return source.replace(pattern, `$1${newVersion}$2`);
}

function updateSwaggerVersion(newVersion) {
  const swaggerPath = path.join(apiDir, "src", "swagger.ts");
  const source = fs.readFileSync(swaggerPath, "utf8");
  fs.writeFileSync(swaggerPath, replaceSwaggerVersion(source, newVersion));
  log(`✓ Updated api/src/swagger.ts version to ${newVersion}`, "green");
}

function changelogPath() {
  return path.join(repoRoot, "CHANGELOG.md");
}

function findSectionEnd(lines, startIndex) {
  let endIndex = startIndex + 1;
  while (endIndex < lines.length && !lines[endIndex].startsWith("## ")) {
    endIndex++;
  }
  return endIndex;
}

function extractUnreleasedChanges(changelog) {
  const lines = changelog.split("\n");
  const unreleasedIndex = lines.findIndex(
    (line) => line.startsWith("## ") && line.includes("[Unreleased]")
  );
  if (unreleasedIndex === -1) {
    return null;
  }

  const unreleasedLines = lines.slice(
    unreleasedIndex + 1,
    findSectionEnd(lines, unreleasedIndex)
  );
  while (unreleasedLines.length > 0 && unreleasedLines[0].trim() === "") {
    unreleasedLines.shift();
  }
  while (
    unreleasedLines.length > 0 &&
    unreleasedLines[unreleasedLines.length - 1].trim() === ""
  ) {
    unreleasedLines.pop();
  }

  const changes = unreleasedLines.join("\n");
  return changes.trim() || null;
}

function rewriteChangelog(changelog, version, changes, today) {
  const lines = changelog.split("\n");
  const unreleasedIndex = lines.findIndex(
    (line) => line.startsWith("## ") && line.includes("[Unreleased]")
  );
  if (unreleasedIndex === -1) {
    throw new Error("CHANGELOG.md has no [Unreleased] section");
  }

  const endIndex = findSectionEnd(lines, unreleasedIndex);
  const entry = [
    "## [Unreleased]",
    "",
    `## ${version} (${today})`,
    "",
    changes.trim(),
    "",
    "",
  ].join("\n");

  lines.splice(unreleasedIndex, endIndex - unreleasedIndex, entry);
  return lines.join("\n");
}

function updateChangelog(version, changes) {
  const filePath = changelogPath();
  const today = new Date().toISOString().split("T")[0];
  const changelog = fs.readFileSync(filePath, "utf8");
  fs.writeFileSync(
    filePath,
    rewriteChangelog(changelog, version, changes, today)
  );
  log(`✓ Updated CHANGELOG.md with version ${version}`, "green");
}

function bumpVersion(currentVersion, type) {
  const parts = currentVersion.split(".").map(Number);
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    throw new Error(`Invalid current version: ${currentVersion}`);
  }

  switch (type) {
    case "patch":
      parts[2]++;
      break;
    case "minor":
      parts[1]++;
      parts[2] = 0;
      break;
    case "major":
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    default:
      throw new Error(
        `Invalid version type: ${type}. Use 'patch', 'minor', or 'major'`
      );
  }

  return parts.join(".");
}

function git(args) {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function assertReleaseBranchIsClean() {
  git(["status"]);
  const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]);
  if (branch !== "main") {
    throw new Error(
      `Refusing to commit and tag from '${branch}'. Release from main, or pass --skip-git.`
    );
  }

  const status = git(["status", "--porcelain"]);
  if (status) {
    throw new Error(
      "Working tree is not clean. Commit or stash changes before releasing."
    );
  }
}

function commitAndTag(version) {
  const commitFiles = [
    "api/package.json",
    "api/package-lock.json",
    "api/src/swagger.ts",
    "CHANGELOG.md",
  ];

  execFileSync("git", ["add", ...commitFiles], {
    cwd: repoRoot,
    stdio: "inherit",
  });
  execFileSync("git", ["commit", "-m", `chore: release version ${version}`], {
    cwd: repoRoot,
    stdio: "inherit",
  });
  execFileSync(
    "git",
    ["tag", "-a", `v${version}`, "-m", `Release version ${version}`],
    { cwd: repoRoot, stdio: "inherit" }
  );
  log(`✓ Created git commit and tag v${version}`, "green");

  log("Pushing changes to remote...", "yellow");
  execFileSync("git", ["push"], { cwd: repoRoot, stdio: "inherit" });
  execFileSync("git", ["push", "--tags"], { cwd: repoRoot, stdio: "inherit" });
  log("✓ Pushed the release commit and tag", "green");
}

function printUsage() {
  log("Usage: npm run release <patch|minor|major> [--skip-git]", "red");
  log("\nExamples:", "cyan");
  log("  npm run release:patch    # 1.0.0 -> 1.0.1", "cyan");
  log("  npm run release:minor    # 1.0.0 -> 1.1.0", "cyan");
  log("  npm run release:major    # 1.0.0 -> 2.0.0", "cyan");
  log("  npm run release -- patch --skip-git", "cyan");
}

function main() {
  log("VC Verifier API Release", "bright");
  log("========================\n", "bright");

  const args = process.argv.slice(2);
  const versionType = args.find((arg) => !arg.startsWith("--"));
  const skipGit = args.includes("--skip-git");

  if (!versionType || !["patch", "minor", "major"].includes(versionType)) {
    printUsage();
    process.exit(1);
  }

  const currentVersion = getCurrentVersion();
  const newVersion = bumpVersion(currentVersion, versionType);

  log(`Current version: ${currentVersion}`, "blue");
  log(`New version: ${newVersion}`, "green");
  log("");

  const changelog = fs.readFileSync(changelogPath(), "utf8");
  const changes = extractUnreleasedChanges(changelog);
  if (!changes) {
    log("No unreleased changelog entries found in CHANGELOG.md", "yellow");
    log(
      "Add entries under the '## [Unreleased]' section before releasing.",
      "yellow"
    );
    process.exit(1);
  }

  log("Unreleased changes:", "green");
  log(changes, "cyan");
  log("");

  if (!skipGit) {
    assertReleaseBranchIsClean();
  }

  updatePackageVersion(newVersion);
  updateLockfileVersion(currentVersion, newVersion);
  updateSwaggerVersion(newVersion);
  updateChangelog(newVersion, changes);

  log("\nRelease summary:", "bright");
  log(`Version: ${currentVersion} -> ${newVersion}`, "blue");
  log("Files updated:", "blue");
  log("  api/package.json", "green");
  log("  api/package-lock.json", "green");
  log("  api/src/swagger.ts", "green");
  log("  CHANGELOG.md", "green");

  if (!skipGit) {
    log("\nCreating git commit and tag...", "yellow");
    commitAndTag(newVersion);
  }

  log("\nRelease preparation complete.", "bright");
  if (skipGit) {
    log("Git commit, tag, and push were skipped.", "yellow");
    return;
  }

  log("The tag push runs CI, which will:", "green");
  log("  - publish the API image", "cyan");
  log("  - create the GitHub Release from this changelog section", "cyan");
}

process.on("SIGINT", () => {
  log("\n\nRelease cancelled", "red");
  process.exit(130);
});

module.exports = {
  bumpVersion,
  extractUnreleasedChanges,
  replaceRootLockVersion,
  replaceSwaggerVersion,
  rewriteChangelog,
};

if (require.main === module) {
  try {
    main();
  } catch (error) {
    log(`\nError: ${error.message}`, "red");
    process.exit(1);
  }
}
