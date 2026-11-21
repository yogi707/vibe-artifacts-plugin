# vibe-artifacts plugin

Publish the HTML and Markdown pages your AI tools make to [vibe-artifacts](https://artifacts-staging.ekyogi.com),
straight from Claude Code (and Codex). Ask "publish this" and Claude asks whether to publish now or
save a draft, then gives you the link. Publishing the same file again adds a new version under the
same link.

## Set up

1. **Create a token.** In vibe-artifacts open **Access tokens** → **New token**. Copy it — you only
   see it once.
2. **Save it on your computer.** Add to `~/.zshrc` (or your shell profile), then open a new terminal:

   ```sh
   export VIBE_ARTIFACTS_TOKEN=<your token>
   ```

3. **Install the plugin in Claude Code:**

   ```sh
   claude plugin marketplace add <path or git URL of this repo>
   claude plugin install vibe-artifacts@vibe-artifacts
   ```

4. Restart Claude Code and say "publish this to vibe-artifacts".

Codex: see [codex/README.md](codex/README.md).

## Pointing at another server

The plugin uses the staging API by default. Set `VIBE_ARTIFACTS_URL` to use another one, for example
local development:

```sh
export VIBE_ARTIFACTS_URL=http://localhost:3000
```

## What's in here

- `.mcp.json` — connects Claude Code to the vibe-artifacts tool server with your token.
- `skills/publish-artifact/SKILL.md` — how Claude should publish (asks first, reuses the artifact on
  re-publish, uses an upload link for big files).
- `.vibe-artifacts.json` (created in your projects) — remembers which file is which artifact. No secrets.

## Troubleshooting

- **401 / "Access token missing"** — `VIBE_ARTIFACTS_TOKEN` isn't set in the shell Claude Code was
  started from. Set it and restart Claude Code.
- **"Access token is invalid, expired or revoked"** — create a new token and update the variable.
- **"Too many publishes from AI tools"** — wait for the time shown and try again.

## Development

`npm test` checks the manifests and the skill, and that no access token is committed.
