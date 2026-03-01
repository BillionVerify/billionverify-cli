import { readConfig, writeConfig } from "../config.js";

export function configCommand(args: string[]): void {
  const action = args[0];

  if (action === "set" && args.length >= 3) {
    const key = args[1];
    const value = args[2];

    if (key !== "api_key") {
      console.error(`Unknown config key: ${key}\n\nAvailable keys: api_key`);
      process.exit(1);
    }

    const config = readConfig();
    config.api_key = value;
    writeConfig(config);
    console.log(`\n  \u2705 API key saved to ~/.billionverify/config.json\n`);
    return;
  }

  if (action === "get") {
    const config = readConfig();
    const key = args[1];

    if (key) {
      const val = (config as Record<string, unknown>)[key];
      if (val) {
        console.log(val);
      } else {
        console.error(`Config key "${key}" is not set`);
        process.exit(1);
      }
    } else {
      console.log(JSON.stringify(config, null, 2));
    }
    return;
  }

  console.error(
    "Usage:\n" +
      "  billionverify config set api_key <key>    Save API key\n" +
      "  billionverify config get [key]             Show config"
  );
  process.exit(1);
}
