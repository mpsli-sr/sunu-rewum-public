const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://sunu-rewum.onrender.com";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T = unknown>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, headers, ...init } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: auth ? "include" : "omit",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      data.message ?? data.error ?? `Erreur ${res.status}`,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const http = {
  get: <T>(path: string, opts?: RequestInit & { auth?: boolean }) =>
    request<T>(path, { ...opts, method: "GET" }),
  post: <T>(
    path: string,
    body?: unknown,
    opts?: RequestInit & { auth?: boolean },
  ) =>
    request<T>(path, {
      ...opts,
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  put: <T>(
    path: string,
    body?: unknown,
    opts?: RequestInit & { auth?: boolean },
  ) =>
    request<T>(path, {
      ...opts,
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  patch: <T>(
    path: string,
    body?: unknown,
    opts?: RequestInit & { auth?: boolean },
  ) =>
    request<T>(path, {
      ...opts,
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  delete: <T>(path: string, opts?: RequestInit & { auth?: boolean }) =>
    request<T>(path, { ...opts, method: "DELETE" }),
};
