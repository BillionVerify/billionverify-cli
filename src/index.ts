#!/usr/bin/env node

import { verifyCommand } from "./commands/verify.js";
import { statusCommand } from "./commands/status.js";
import { downloadCommand } from "./commands/download.js";
import { creditsCommand } from "./commands/credits.js";
import { configCommand } from "./commands/config.js";

const VERSION = "1.0.0";

const HELP = `
  \x1b[1mbillionverify\x1b[0m - Email verification from the command line

  \x1b[2mUsage:\x1b[0m
    billionverify <command> [options]

  \x1b[2mCommands:\x1b[0m
    verify <email> [emails...]     Verify one or more emails
    verify -f <file.csv>           Upload file for bulk verification
    status <task_id>               Check file verification job status
    download <task_id>             Download verification results
    credits                        Check credit balance
    config set api_key <key>       Save API key
    config get [key]               Show config

  \x1b[2mGlobal Options:\x1b[0m
    --api-key <key>                Use specific API key
    --json                         Output as JSON
    --help, -h                     Show help
    --version, -v                  Show version

  \x1b[2mExamples:\x1b[0m
    billionverify verify user@example.com
    billionverify verify a@x.com b@y.com c@z.com
    billionverify verify -f emails.csv
    billionverify status task_abc123 --wait
    billionverify download task_abc123 --valid --invalid -o results.csv
    billionverify credits

  \x1b[2mDocs:\x1b[0m https://billionverify.com/docs
`;

function parseArgs(argv: string[]): {
  command: string;
  args: string[];
  flags: Record<string, string | boolean>;
} {
  const raw = argv.slice(2);
  const flags: Record<string, string | boolean> = {};
  const positional: string[] = [];

  for (let i = 0; i < raw.length; i++) {
    const arg = raw[i];
    if (arg === "--json") {
      flags.json = true;
    } else if (arg === "--wait" || arg === "-w") {
      flags.wait = true;
    } else if (arg === "--help" || arg === "-h") {
      flags.help = true;
    } else if (arg === "--version" || arg === "-v") {
      flags.version = true;
    } else if (arg === "--no-smtp") {
      flags.noSmtp = true;
    } else if (arg === "--valid") {
      flags.valid = true;
    } else if (arg === "--invalid") {
      flags.invalid = true;
    } else if (arg === "--catchall") {
      flags.catchall = true;
    } else if (arg === "--role") {
      flags.role = true;
    } else if (arg === "--unknown") {
      flags.unknown = true;
    } else if (arg === "--disposable") {
      flags.disposable = true;
    } else if (arg === "--risky") {
      flags.risky = true;
    } else if ((arg === "--api-key" || arg === "-k") && i + 1 < raw.length) {
      flags.apiKey = raw[++i];
    } else if ((arg === "-f" || arg === "--file") && i + 1 < raw.length) {
      flags.file = raw[++i];
    } else if ((arg === "-o" || arg === "--output") && i + 1 < raw.length) {
      flags.output = raw[++i];
    } else if (arg === "--email-column" && i + 1 < raw.length) {
      flags.emailColumn = raw[++i];
    } else if (arg === "--poll" && i + 1 < raw.length) {
      flags.poll = raw[++i];
    } else if (!arg.startsWith("-")) {
      positional.push(arg);
    }
  }

  const command = positional[0] || "";
  const args = positional.slice(1);

  return { command, args, flags };
}

async function main(): Promise<void> {
  const { command, args, flags } = parseArgs(process.argv);

  if (flags.version) {
    console.log(VERSION);
    return;
  }

  if (flags.help || !command) {
    console.log(HELP);
    return;
  }

  const commonFlags = {
    apiKey: flags.apiKey as string | undefined,
    json: !!flags.json,
  };

  switch (command) {
    case "verify":
      await verifyCommand(args, {
        ...commonFlags,
        file: flags.file as string | undefined,
        emailColumn: flags.emailColumn as string | undefined,
        noSmtp: !!flags.noSmtp,
      });
      break;

    case "status":
      await statusCommand(args, {
        ...commonFlags,
        wait: !!flags.wait,
        poll: flags.poll ? Number(flags.poll) : undefined,
      });
      break;

    case "download":
      await downloadCommand(args, {
        ...commonFlags,
        output: flags.output as string | undefined,
        valid: !!flags.valid,
        invalid: !!flags.invalid,
        catchall: !!flags.catchall,
        role: !!flags.role,
        unknown: !!flags.unknown,
        disposable: !!flags.disposable,
        risky: !!flags.risky,
      });
      break;

    case "credits":
      await creditsCommand(commonFlags);
      break;

    case "config":
      configCommand(args);
      break;

    default:
      console.error(`Unknown command: ${command}\n\nRun "billionverify --help" for usage.`);
      process.exit(1);
  }
}

main();
