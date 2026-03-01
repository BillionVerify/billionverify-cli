import { apiRequest } from "../api.js";
import { getApiKey } from "../config.js";
import { printJobStatus } from "../output.js";

interface Flags {
  apiKey?: string;
  json: boolean;
  wait?: boolean;
  poll?: number;
}

export async function statusCommand(args: string[], flags: Flags): Promise<void> {
  if (args.length === 0) {
    console.error("Usage: billionverify status <task_id>");
    process.exit(1);
  }

  const apiKey = getApiKey(flags);
  const taskId = args[0];
  const pollInterval = (flags.poll || 5) * 1000;

  try {
    if (flags.wait) {
      // Poll until completion
      while (true) {
        const data = await apiRequest<Record<string, unknown>>(
          apiKey,
          `/verify/file/${taskId}?timeout=30`,
          { timeout: 40000 }
        );
        const status = data.status as string;

        if (status === "completed" || status === "failed") {
          printJobStatus(data, flags.json);
          if (status === "failed") process.exit(1);
          return;
        }

        if (!flags.json) {
          process.stdout.write(
            `\r  Processing... ${data.progress_percent || 0}%`
          );
        }
        await new Promise((r) => setTimeout(r, pollInterval));
      }
    } else {
      const data = await apiRequest<Record<string, unknown>>(
        apiKey,
        `/verify/file/${taskId}`
      );
      printJobStatus(data, flags.json);
    }
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }
}
