---
name: publish-artifact
description: Publish an HTML or Markdown page (a report, plan, audit, doc) to vibe-artifacts and get a shareable link, or add a new version of one published before. Use when the user asks to publish, share, upload or post a page or artifact to vibe-artifacts, or says "publish this".
---

# Publish to vibe-artifacts

vibe-artifacts hosts HTML and Markdown pages at a stable link, with drafts, versions and sharing.
The `vibe-artifacts` MCP server gives you these tools:

- `publish_artifact` — create a new artifact
- `publish_new_version` — add a version to an existing artifact (the link stays the same)
- `publish_draft` — make a draft version live
- `list_my_artifacts` — find the user's artifacts

## Steps

1. **Pick the file.** Use the page you just made, or the one the user names. Only `.html`, `.htm`
   and `.md` are supported; for anything else, say so and offer to save it as HTML or Markdown first.

2. **Was it published before?** Read `.vibe-artifacts.json` in the project root if it exists. It maps
   file paths (relative to the project root) to artifact slugs, e.g. `{ "reports/latency.html": "k3j9x2" }`.
   If the file is not there but the user says it was published, call `list_my_artifacts` with a few
   words of the title and confirm which one with the user.

3. **Ask once, in one message, and wait for the answer.** Never publish without it.
   - New artifact: suggest a title, suggest up to 5 tags (lowercase letters, numbers, dashes), and ask
     who can see it — **private** (only them), **specific people** (ask for their emails) or
     **public** — and whether to **publish now or save as a draft**.
   - Known artifact: "Update “<title>” as a new version? Publish now or keep it as a draft?"

4. **Call the tool.** Pass `sourceTool: "claude-code"` to `publish_artifact` when you are Claude Code
   and `"codex"` when you are Codex. `fileName` must be the file's base name (`latency.html`, not
   `reports/latency.html`).
   - File of 200 KB or less: pass its full text as `content`.
   - Bigger file: call without `content`. The result has a `curl` command; run it exactly as given
     from the directory that contains the file. It prints the publish result as JSON. The link works
     once and expires after 5 minutes; if the upload fails with a fixable error, fix the file and run
     the same command again, otherwise call the tool again for a new link.

5. **Remember it.** Add or update the file's entry in `.vibe-artifacts.json` with the returned `slug`
   (create the file if needed; it holds no secrets).

6. **Reply** with the link and what happened, in one or two lines:
   - published: "Published: <url>"
   - draft: "Saved as a draft: <url> — only you can see it until you publish."
   To publish a draft later, use `publish_draft`.

## When something goes wrong

- **The tools are missing, or calls fail with 401 / "Access token …"**: the user needs a token.
  Tell them to open vibe-artifacts → **Access tokens** → **New token**, then add
  `export VIBE_ARTIFACTS_TOKEN=<token>` to `~/.zshrc` (or their shell profile) and restart Claude Code.
- **"Too many publishes from AI tools"**: tell them when they can try again.
- **Validation errors** (tags, file type, empty file, size): explain in plain words and offer a fix.

## Never

- Never print, echo, log or put the access token in a command, a file or the chat.
- Never call `publish_artifact`, `publish_new_version` or `publish_draft` before the user answered step 3.
