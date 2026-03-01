const BASE_URL = "https://api.billionverify.com/v1";

interface ApiOptions {
  method?: string;
  body?: unknown;
  timeout?: number;
}

export async function apiRequest<T>(
  apiKey: string,
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = "GET", body, timeout = 30000 } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const headers: Record<string, string> = {
      "BV-API-KEY": apiKey,
      "User-Agent": "billionverify-cli/1.0.0",
    };
    if (body) headers["Content-Type"] = "application/json";

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as Record<string, unknown>;
      const msg =
        (err.error as Record<string, string>)?.message ||
        (err as Record<string, string>).message ||
        res.statusText;
      throw new Error(`API error (${res.status}): ${msg}`);
    }

    const json = (await res.json()) as { data: T };
    return json.data;
  } finally {
    clearTimeout(timer);
  }
}

export async function uploadFile(
  apiKey: string,
  filePath: string,
  opts: { checkSmtp?: boolean; emailColumn?: string; preserveOriginal?: boolean } = {}
): Promise<Record<string, unknown>> {
  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    throw new Error(`File not found: ${filePath}`);
  }

  const formData = new FormData();
  formData.append("file", file);
  if (opts.checkSmtp !== undefined) formData.append("check_smtp", String(opts.checkSmtp));
  if (opts.emailColumn) formData.append("email_column", opts.emailColumn);
  if (opts.preserveOriginal !== undefined) formData.append("preserve_original", String(opts.preserveOriginal));

  const res = await fetch(`${BASE_URL}/verify/file`, {
    method: "POST",
    headers: {
      "BV-API-KEY": apiKey,
      "User-Agent": "billionverify-cli/1.0.0",
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, unknown>;
    const msg =
      (err.error as Record<string, string>)?.message ||
      (err as Record<string, string>).message ||
      res.statusText;
    throw new Error(`API error (${res.status}): ${msg}`);
  }

  const json = (await res.json()) as { data: Record<string, unknown> };
  return json.data;
}

export async function downloadResults(
  apiKey: string,
  taskId: string,
  filters: Record<string, boolean>,
  outputPath: string
): Promise<void> {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v) params.set(k, "true");
  }
  const query = params.toString();
  const url = `${BASE_URL}/verify/file/${taskId}/results${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    headers: {
      "BV-API-KEY": apiKey,
      "User-Agent": "billionverify-cli/1.0.0",
    },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`API error (${res.status}): ${res.statusText}`);
  }

  await Bun.write(outputPath, res);
}
