# billionverify

BillionVerify CLI - Email verification from the command line.

**Documentation:** https://billionverify.com/docs

## Installation

```bash
npm install -g billionverify
```

Or run directly:

```bash
npx billionverify verify user@example.com
```

## Setup

```bash
# Save your API key
billionverify config set api_key YOUR_API_KEY

# Or use environment variable
export BILLIONVERIFY_API_KEY=YOUR_API_KEY
```

Get your API key at: https://billionverify.com/auth/sign-in?next=/home/api-keys

## Usage

### Verify a single email

```bash
billionverify verify user@example.com
```

Output:

```
  ✅ user@example.com
  Status:       valid
  Score:        0.95
  Deliverable:  yes
  Domain:       example.com (10y)
  MX:           mx1.example.com
  Credits:      1
```

### Batch verify multiple emails

```bash
billionverify verify alice@gmail.com bob@company.com test@tempmail.org
```

### Upload a file for bulk verification

```bash
billionverify verify -f emails.csv
```

### Check job status

```bash
billionverify status <task_id>

# Wait for completion
billionverify status <task_id> --wait
```

### Download results

```bash
# Download all results
billionverify download <task_id>

# Download with filters
billionverify download <task_id> --valid --invalid -o results.csv
```

### Check credits

```bash
billionverify credits
```

## Options

### Global

| Option | Description |
|---|---|
| `--api-key <key>` | Use specific API key |
| `--json` | Output as JSON |
| `--help, -h` | Show help |
| `--version, -v` | Show version |

### verify

| Option | Description |
|---|---|
| `-f <file>` | Upload file for bulk verification |
| `--email-column <col>` | Column name containing emails |
| `--no-smtp` | Skip SMTP verification |

### status

| Option | Description |
|---|---|
| `--wait, -w` | Poll until job completes |
| `--poll <seconds>` | Poll interval (default: 5) |

### download

| Option | Description |
|---|---|
| `-o <file>` | Output file path (default: `<task_id>-results.csv`) |
| `--valid` | Include valid emails |
| `--invalid` | Include invalid emails |
| `--catchall` | Include catch-all emails |
| `--role` | Include role emails |
| `--unknown` | Include unknown emails |
| `--disposable` | Include disposable emails |
| `--risky` | Include risky emails |

## API Key Priority

1. `--api-key` flag
2. `BILLIONVERIFY_API_KEY` environment variable
3. `~/.billionverify/config.json`

## License

MIT
