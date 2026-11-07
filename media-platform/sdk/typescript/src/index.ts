/**
 * media-platform ince TypeScript istemcisi.
 *
 * Tuketen projeler (heplin, ...) icin: asset submit, durum sorgu, sonuc cekme
 * (delete-on-delivery), iptal + webhook imza dogrulama. `fetch` ve Web Crypto'ya
 * dayanir (Node >= 18 ve modern tarayicilarda yerlesik); baska bagimlilik yok.
 */

export const SIGNATURE_HEADER = "x-media-signature";

export type Profile = "document" | "media";

export interface SubmitResult {
  asset_id: string;
  job_id: string;
}

export interface JobStatus {
  job_id: string;
  asset_id: string;
  status: string;
  stage: string;
  error_code: string;
  result_ready: boolean;
}

export interface ClientOptions {
  baseUrl: string;
  token: string;
  /** Test/ozel transport icin; varsayilan global fetch. */
  fetch?: typeof fetch;
  timeoutMs?: number;
}

export class MediaPlatformError extends Error {
  readonly statusCode: number;
  readonly code: string;
  constructor(statusCode: number, code = "", message?: string) {
    super(message ?? code ?? `HTTP ${statusCode}`);
    this.name = "MediaPlatformError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class MediaPlatformClient {
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;

  constructor(options: ClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.token = options.token;
    this.fetchImpl = options.fetch ?? globalThis.fetch;
    this.timeoutMs = options.timeoutMs ?? 30_000;
    if (!this.fetchImpl) {
      throw new Error("fetch mevcut degil; options.fetch ile saglayin");
    }
  }

  /**
   * Asset gonder. Belge profilinde `documentType` zorunlu; medya profilinde tur
   * byte'lardan tespit edilir.
   */
  async submit(
    data: Uint8Array | ArrayBuffer | Blob,
    opts: { documentType?: string; profile?: Profile } = {},
  ): Promise<SubmitResult> {
    const headers: Record<string, string> = {
      "Content-Type": "application/octet-stream",
      "X-Profile": opts.profile ?? "document",
    };
    if (opts.documentType) headers["X-Document-Type"] = opts.documentType;
    return this.request<SubmitResult>("POST", "/v1/assets", { headers, body: data });
  }

  status(jobId: string): Promise<JobStatus> {
    return this.request<JobStatus>("GET", `/v1/jobs/${encodeURIComponent(jobId)}`);
  }

  /** Sonucu cek (delete-on-delivery: ikinci cagri NOT_FOUND). */
  result<T = Record<string, unknown>>(jobId: string): Promise<T> {
    return this.request<T>("GET", `/v1/jobs/${encodeURIComponent(jobId)}/result`);
  }

  cancel(jobId: string): Promise<{ job_id: string; status: string }> {
    return this.request("POST", `/v1/jobs/${encodeURIComponent(jobId)}/cancel`);
  }

  private async request<T>(
    method: string,
    path: string,
    init: { headers?: Record<string, string>; body?: BodyInit } = {},
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.token}`, ...(init.headers ?? {}) },
        body: init.body,
        signal: controller.signal,
      });
      const text = await response.text();
      const parsed = text ? JSON.parse(text) : {};
      if (!response.ok) {
        const code = typeof parsed?.code === "string" ? parsed.code : "";
        throw new MediaPlatformError(response.status, code);
      }
      return parsed as T;
    } finally {
      clearTimeout(timer);
    }
  }
}

/**
 * Webhook imza dogrulama (sunucuyla ayni sema: HMAC-SHA256, ham govde).
 * `body` webhook POST'unun HAM govdesi olmali (yeniden serialize edilmis JSON degil).
 */
export async function verifyWebhook(
  secret: string,
  body: string | Uint8Array,
  signature: string | null | undefined,
): Promise<boolean> {
  if (!signature) return false;
  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  const bodyData = typeof body === "string" ? enc.encode(body) : body;
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, bodyData as BufferSource);
  const hex = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const expected = `sha256=${hex}`;
  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
