import { apiRequest, uploadFile } from "../api.js";
import { getApiKey } from "../config.js";
import {
  printVerifyResult,
  printBatchResults,
  printFileUpload,
} from "../output.js";

interface Flags {
  apiKey?: string;
  json: boolean;
  file?: string;
  emailColumn?: string;
  noSmtp?: boolean;
}

export async function verifyCommand(args: string[], flags: Flags): Promise<void> {
  const apiKey = getApiKey(flags);

  // File upload mode
  if (flags.file) {
    try {
      const data = await uploadFile(apiKey, flags.file, {
        checkSmtp: !flags.noSmtp,
        emailColumn: flags.emailColumn,
      });
      printFileUpload(data, flags.json);
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
    return;
  }

  // Must have at least one email
  if (args.length === 0) {
    console.error(
      "Usage:\n" +
        "  billionverify verify <email>              Verify single email\n" +
        "  billionverify verify <e1> <e2> ...        Batch verify (max 50)\n" +
        "  billionverify verify -f <file.csv>        Upload file for verification"
    );
    process.exit(1);
  }

  try {
    if (args.length === 1) {
      // Single verification
      const result = await apiRequest<Record<string, unknown>>(
        apiKey,
        "/verify/single",
        {
          method: "POST",
          body: { email: args[0], check_smtp: !flags.noSmtp },
        }
      );
      printVerifyResult(result, flags.json);
    } else {
      // Batch verification
      if (args.length > 50) {
        console.error(
          "Error: Maximum 50 emails per batch. For larger lists, use:\n" +
            "  billionverify verify -f <file.csv>"
        );
        process.exit(1);
      }
      const data = await apiRequest<Record<string, unknown>>(
        apiKey,
        "/verify/bulk",
        {
          method: "POST",
          body: { emails: args, check_smtp: !flags.noSmtp },
        }
      );
      printBatchResults(data, flags.json);
    }
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }
}
