// Use same-origin /api proxy (via Next.js rewrites) to avoid cross-origin
// issues in Safari. The rewrite forwards to NEXT_PUBLIC_API_URL on the server.
const API_URL = "/api";

export interface Deal {
  id: number;
  title: string;
  slug: string;
  departure_city: string;
  destination_city: string;
  price: number;
  currency: string;
  travel_dates: string;
  affiliate_url: string;
  content: string;
  image_url?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DealsResponse {
  deals: Deal[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateDealInput {
  title: string;
  departure_city: string;
  destination_city: string;
  price: number;
  currency: string;
  travel_dates: string;
  affiliate_url: string;
  content: string;
  image_url?: string;
  published: boolean;
}

export type UpdateDealInput = Partial<CreateDealInput>;

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

export function setToken(token: string): void {
  localStorage.setItem("admin_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("admin_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { headers: customHeaders, ...restOptions } = options;
  const authHeaders: Record<string, string> = {};
  const token = getToken();
  if (token) {
    authHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(customHeaders as Record<string, string>),
    },
    ...restOptions,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      body.error || `Request failed with status ${res.status}`,
      res.status
    );
  }

  return res.json();
}

// Public endpoints
export async function getPublicDeals(
  page = 1,
  limit = 20
): Promise<DealsResponse> {
  return request<DealsResponse>(`/deals?page=${page}&limit=${limit}`);
}

export async function getDealBySlug(slug: string): Promise<Deal> {
  return request<Deal>(`/deals/${slug}`);
}

// Admin endpoints
export async function adminLogin(
  email: string,
  password: string
): Promise<{ message: string; token: string }> {
  const res = await request<{ message: string; token: string }>("/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(res.token);
  return res;
}

export async function getAdminDeals(
  page = 1,
  limit = 50
): Promise<DealsResponse> {
  return request<DealsResponse>(`/admin/deals?page=${page}&limit=${limit}`);
}

export async function createDeal(data: CreateDealInput): Promise<Deal> {
  return request<Deal>("/admin/deals", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDeal(
  id: number,
  data: UpdateDealInput
): Promise<Deal> {
  return request<Deal>(`/admin/deals/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteDeal(id: number): Promise<{ message: string }> {
  return request<{ message: string }>(`/admin/deals/${id}`, {
    method: "DELETE",
  });
}
