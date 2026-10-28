/**
 * Thin fetch wrapper for talking to the Farmsapp backend.
 *
 * All requests go through the Next.js proxy at /api/backend/* (configured in
 * next.config.ts), which forwards them server-side to the Spring Boot app.
 * That means:
 *   - the browser only ever talks to this Next.js app's own origin
 *     (no CORS setup needed on the backend)
 *   - the real backend URL never has to appear in client-side code
 *
 * Usage:
 *   const products = await backendGet<Product[]>("/v1/commerce/products");
 *   await backendPost("/v1/cart/add", { skuId: 123, qty: 2 });
 */

const PROXY_PREFIX = "/api/backend";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = `${PROXY_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const contentType = res.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text();

  if (!res.ok) {
    throw new ApiError(
      `Backend request to ${path} failed with ${res.status}`,
      res.status,
      body
    );
  }

  return body as T;
}

export function backendGet<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, { ...init, method: "GET" });
}

export function backendPost<T>(
  path: string,
  data?: unknown,
  init?: RequestInit
): Promise<T> {
  return request<T>(path, {
    ...init,
    method: "POST",
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
}

export function backendPut<T>(
  path: string,
  data?: unknown,
  init?: RequestInit
): Promise<T> {
  return request<T>(path, {
    ...init,
    method: "PUT",
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
}

export function backendDelete<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, { ...init, method: "DELETE" });
}
