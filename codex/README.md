# Using vibe-artifacts from Codex

Codex talks to the same vibe-artifacts tool server as Claude Code.

1. Create a token in vibe-artifacts (**Access tokens** → **New token**) and add it to your shell
   profile:

   ```sh
   export VIBE_ARTIFACTS_TOKEN=<your token>
   ```

2. Add the server to `~/.codex/config.toml` (use your vibe-artifacts API address; staging shown):

   ```toml
   [mcp_servers.vibe-artifacts]
   url = "https://artifacts-api-staging.ekyogi.com/api/v1/mcp"
   bearer_token_env_var = "VIBE_ARTIFACTS_TOKEN"
   ```

3. Give Codex the publishing instructions by copying the skill:

   ```sh
   mkdir -p ~/.codex/skills
   cp -R skills/publish-artifact ~/.codex/skills/
   ```

4. Restart Codex and ask it to "publish this to vibe-artifacts".

If your Codex version names these settings differently, check the Codex documentation for
"MCP servers" (streamable HTTP with a bearer token from an environment variable) and "skills".
