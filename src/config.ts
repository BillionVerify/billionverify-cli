import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const CONFIG_DIR = join(homedir(), ".billionverify");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

interface Config {
  api_key?: string;
}

function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function readConfig(): Config {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
  } catch {
    return {};
  }
}

export function writeConfig(config: Config): void {
  ensureConfigDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n");
}

export function getApiKey(flags: { apiKey?: string }): string {
  const key =
    flags.apiKey ||
    process.env.BILLIONVERIFY_API_KEY ||
    readConfig().api_key;

  if (!key) {
    console.error(
      "Error: API key not found.\n\n" +
        "Set it with one of:\n" +
        "  billionverify config set api_key <key>\n" +
        "  export BILLIONVERIFY_API_KEY=<key>\n" +
        "  --api-key <key>\n\n" +
        "Get your key at: https://billionverify.com/auth/sign-in?next=/home/api-keys"
    );
    process.exit(1);
  }
  return key;
}
