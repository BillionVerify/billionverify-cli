import { downloadResults } from "../api.js";
import { getApiKey } from "../config.js";

interface Flags {
  apiKey?: string;
  json: boolean;
  output?: string;
  valid?: boolean;
  invalid?: boolean;
  catchall?: boolean;
  role?: boolean;
  unknown?: boolean;
  disposable?: boolean;
  risky?: boolean;
}

export async function downloadCommand(args: string[], flags: Flags): Promise<void> {
  if (args.length === 0) {
    console.error("Usage: billionverify download <task_id> [-o output.csv]");
    process.exit(1);
  }

  const apiKey = getApiKey(flags);
  const taskId = args[0];
  const outputPath = flags.output || `${taskId}-results.csv`;

  const filters: Record<string, boolean> = {};
  if (flags.valid) filters.valid = true;
  if (flags.invalid) filters.invalid = true;
  if (flags.catchall) filters.catchall = true;
  if (flags.role) filters.role = true;
  if (flags.unknown) filters.unknown = true;
  if (flags.disposable) filters.disposable = true;
  if (flags.risky) filters.risky = true;

  try {
    await downloadResults(apiKey, taskId, filters, outputPath);
    if (flags.json) {
      console.log(JSON.stringify({ file: outputPath }));
    } else {
      console.log(`\n  \u2705 Results saved to ${outputPath}\n`);
    }
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }
}
