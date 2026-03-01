import { apiRequest } from "../api.js";
import { getApiKey } from "../config.js";
import { printCredits } from "../output.js";

interface Flags {
  apiKey?: string;
  json: boolean;
}

export async function creditsCommand(flags: Flags): Promise<void> {
  const apiKey = getApiKey(flags);

  try {
    const data = await apiRequest<Record<string, unknown>>(apiKey, "/credits");
    printCredits(data, flags.json);
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }
}
