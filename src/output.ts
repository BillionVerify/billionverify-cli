const COLORS = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  white: "\x1b[37m",
};

const STATUS_DISPLAY: Record<string, { emoji: string; color: string }> = {
  valid: { emoji: "\u2705", color: COLORS.green },
  invalid: { emoji: "\u274c", color: COLORS.red },
  unknown: { emoji: "\u2753", color: COLORS.yellow },
  risky: { emoji: "\u26a0\ufe0f", color: COLORS.yellow },
  disposable: { emoji: "\ud83d\uddd1\ufe0f", color: COLORS.magenta },
  catchall: { emoji: "\ud83c\udfaf", color: COLORS.cyan },
  role: { emoji: "\ud83d\udc64", color: COLORS.cyan },
};

export function printVerifyResult(result: Record<string, unknown>, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(result));
    return;
  }

  const status = result.status as string;
  const display = STATUS_DISPLAY[status] || { emoji: "?", color: COLORS.white };

  console.log();
  console.log(`  ${display.emoji} ${COLORS.bold}${result.email}${COLORS.reset}`);
  console.log(`  ${COLORS.dim}Status:${COLORS.reset}       ${display.color}${status}${COLORS.reset}`);
  console.log(`  ${COLORS.dim}Score:${COLORS.reset}        ${result.score}`);
  console.log(`  ${COLORS.dim}Deliverable:${COLORS.reset}  ${result.is_deliverable ? "yes" : "no"}`);
  console.log(`  ${COLORS.dim}Domain:${COLORS.reset}       ${result.domain}${result.domain_age ? ` (${result.domain_age}y)` : ""}`);

  if (result.mx_records && (result.mx_records as string[]).length > 0) {
    console.log(`  ${COLORS.dim}MX:${COLORS.reset}           ${(result.mx_records as string[]).join(", ")}`);
  }
  if (result.suggestion) {
    console.log(`  ${COLORS.dim}Suggestion:${COLORS.reset}   ${COLORS.yellow}${result.suggestion}${COLORS.reset}`);
  }
  if (result.reason) {
    console.log(`  ${COLORS.dim}Reason:${COLORS.reset}       ${result.reason}`);
  }
  console.log(`  ${COLORS.dim}Credits:${COLORS.reset}      ${result.credits_used}`);
  console.log();
}

export function printBatchResults(data: Record<string, unknown>, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(data));
    return;
  }

  const results = data.results as Record<string, unknown>[];
  for (const result of results) {
    const status = result.status as string;
    const display = STATUS_DISPLAY[status] || { emoji: "?", color: COLORS.white };
    console.log(
      `  ${display.emoji} ${display.color}${(status + "").padEnd(11)}${COLORS.reset} ${result.email}`
    );
  }

  console.log();
  console.log(
    `  ${COLORS.dim}Total: ${data.total_emails} | Valid: ${data.valid_emails} | Invalid: ${data.invalid_emails} | Credits: ${data.credits_used}${COLORS.reset}`
  );
  console.log();
}

export function printCredits(data: Record<string, unknown>, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(data));
    return;
  }

  console.log();
  console.log(`  ${COLORS.bold}Credit Balance${COLORS.reset}`);
  console.log(`  ${COLORS.dim}Balance:${COLORS.reset}   ${COLORS.green}${(data.credits_balance as number).toLocaleString()}${COLORS.reset}`);
  console.log(`  ${COLORS.dim}Used:${COLORS.reset}      ${(data.credits_consumed as number).toLocaleString()}`);
  console.log(`  ${COLORS.dim}Added:${COLORS.reset}     ${(data.credits_added as number).toLocaleString()}`);
  console.log(`  ${COLORS.dim}Key:${COLORS.reset}       ${data.api_key_name}`);
  console.log();
}

export function printFileUpload(data: Record<string, unknown>, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(data));
    return;
  }

  console.log();
  console.log(`  ${COLORS.green}\u2705 File uploaded${COLORS.reset}`);
  console.log(`  ${COLORS.dim}Task ID:${COLORS.reset}  ${data.task_id}`);
  console.log(`  ${COLORS.dim}File:${COLORS.reset}     ${data.file_name}`);
  console.log(`  ${COLORS.dim}Emails:${COLORS.reset}   ${data.unique_emails || data.estimated_count}`);
  console.log();
  console.log(`  Track progress: ${COLORS.cyan}billionverify status ${data.task_id}${COLORS.reset}`);
  console.log();
}

export function printJobStatus(data: Record<string, unknown>, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(data));
    return;
  }

  const status = data.status as string;
  const statusColors: Record<string, string> = {
    pending: COLORS.yellow,
    processing: COLORS.cyan,
    completed: COLORS.green,
    failed: COLORS.red,
  };
  const color = statusColors[status] || COLORS.white;

  console.log();
  console.log(`  ${COLORS.bold}Job ${data.job_id}${COLORS.reset}`);
  console.log(`  ${COLORS.dim}Status:${COLORS.reset}    ${color}${status}${COLORS.reset}`);
  console.log(`  ${COLORS.dim}File:${COLORS.reset}      ${data.file_name}`);
  console.log(`  ${COLORS.dim}Progress:${COLORS.reset}  ${data.progress_percent || 0}%`);

  if (status === "completed") {
    console.log(`  ${COLORS.dim}Total:${COLORS.reset}     ${data.total_emails}`);
    console.log(`  ${COLORS.dim}Valid:${COLORS.reset}     ${data.valid_emails}`);
    console.log(`  ${COLORS.dim}Invalid:${COLORS.reset}   ${data.invalid_emails}`);
    console.log(`  ${COLORS.dim}Credits:${COLORS.reset}   ${data.credits_used}`);
    console.log(`  ${COLORS.dim}Time:${COLORS.reset}      ${data.process_time_seconds}s`);
    console.log();
    console.log(`  Download: ${COLORS.cyan}billionverify download ${data.job_id}${COLORS.reset}`);
  }
  console.log();
}
