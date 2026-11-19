const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const {
  bumpVersion,
  extractUnreleasedChanges,
  localTagExists,
  replaceRootLockVersion,
  replaceSwaggerVersion,
  rewriteChangelog,
} = require("./release");

const changelog = `VC Verifier Changelog
=================

## [Unreleased]

### Fixed
- Reject a bad previousProof

## 4.0.1 (2026-11-13)

### Fixed
- Older fix
`;

describe("bumpVersion", () => {
  it("bumps patch, minor, and major", () => {
    assert.equal(bumpVersion("4.0.1", "patch"), "4.0.2");
    assert.equal(bumpVersion("4.0.1", "minor"), "4.1.0");
    assert.equal(bumpVersion("4.0.1", "major"), "5.0.0");
  });

  it("rejects an unknown bump or a non-semver version", () => {
    assert.throws(() => bumpVersion("4.0.1", "beta"));
    assert.throws(() => bumpVersion("4.0", "patch"));
  });
});

describe("changelog", () => {
  it("reads the unreleased section and stops at the next heading", () => {
    assert.equal(
      extractUnreleasedChanges(changelog),
      "### Fixed\n- Reject a bad previousProof"
    );
  });

  it("returns null when unreleased has no entries", () => {
    assert.equal(
      extractUnreleasedChanges("## [Unreleased]\n\n## 1.0.0 (2026-01-01)\n"),
      null
    );
  });

  it("moves unreleased notes under the new version and keeps an empty section", () => {
    const updated = rewriteChangelog(
      changelog,
      "4.0.2",
      "### Fixed\n- Reject a bad previousProof",
      "2026-11-19"
    );

    assert.match(updated, /^## \[Unreleased\]\n\n## 4\.0\.2 \(2026-11-19\)/m);
    assert.match(
      updated,
      /## 4\.0\.2 \(2026-11-19\)\n\n### Fixed\n- Reject a bad previousProof\n+## 4\.0\.1/
    );
    assert.equal(extractUnreleasedChanges(updated), null);
  });
});

describe("localTagExists", () => {
  it("recognizes a tag in a repository and misses one that is absent", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "release-tag-"));
    try {
      execFileSync("git", ["init", "-q"], { cwd: dir });
      execFileSync(
        "git",
        [
          "-c",
          "user.email=test@example.com",
          "-c",
          "user.name=test",
          "commit",
          "--allow-empty",
          "-m",
          "init",
        ],
        { cwd: dir }
      );
      execFileSync("git", ["tag", "v1.2.3"], { cwd: dir });

      assert.equal(localTagExists("v1.2.3", dir), true);
      assert.equal(localTagExists("v9.9.9", dir), false);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("version files", () => {
  it("replaces only the two root lockfile versions", () => {
    const lock = `{
  "name": "vc-verifier",
  "version": "4.0.1",
  "packages": {
    "": {
      "version": "4.0.1",
      "dependencies": {
        "left-pad": "4.0.1"
      }
    }
  }
}
`;

    const updated = replaceRootLockVersion(lock, "4.0.1", "4.0.2");
    assert.match(updated, /"name": "vc-verifier",\n {2}"version": "4.0.2"/);
    assert.match(updated, /"": \{\n {6}"version": "4.0.2"/);
    assert.match(updated, /"left-pad": "4.0.1"/);
  });

  it("replaces the swagger info version", () => {
    const source = "const swaggerOptions = { info: { version: '4.0.1', title: 'API' } };";
    assert.equal(
      replaceSwaggerVersion(source, "4.0.2"),
      "const swaggerOptions = { info: { version: '4.0.2', title: 'API' } };"
    );
  });
});
