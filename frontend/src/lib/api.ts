const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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
  original_price?: number;
  expires_at?: string;
  scheduled_at?: string;
  click_count: number;
  tags: string[];
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
  original_price?: number;
  expires_at?: string;
  scheduled_at?: string;
  tags?: string[];
}

export type UpdateDealInput = Partial<CreateDealInput>;

export interface Destination {
  city: string;
  deal_count: number;
}

export interface PriceAlert {
  id: number;
  email: string;
  departure_city: string;
  destination_city: string;
  target_price: number;
  currency: string;
  created_at: string;
}

export interface AnalyticsData {
  total_deals: number;
  published_deals: number;
  total_clicks: number;
  subscribers: number;
  top_deals: { id: number; title: string; click_count: number }[];
}

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

// ── Public endpoints ──────────────────────────────────

export interface DealFilters {
  q?: string;
  departure?: string;
  destination?: string;
  min_price?: number;
  max_price?: number;
  tag?: string;
  sort?: "newest" | "oldest" | "price_asc" | "price_desc";
}

export async function getPublicDeals(
  page = 1,
  limit = 20,
  filters: DealFilters = {}
): Promise<DealsResponse> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (filters.q) params.set("q", filters.q);
  if (filters.departure) params.set("departure", filters.departure);
  if (filters.destination) params.set("destination", filters.destination);
  if (filters.min_price !== undefined) params.set("min_price", String(filters.min_price));
  if (filters.max_price !== undefined) params.set("max_price", String(filters.max_price));
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.sort) params.set("sort", filters.sort);
  return request<DealsResponse>(`/deals?${params.toString()}`);
}

export async function getDealBySlug(slug: string): Promise<Deal> {
  return request<Deal>(`/deals/${slug}`);
}

export async function trackClick(slug: string): Promise<void> {
  await request(`/deals/${slug}/click`, { method: "POST" });
}

export async function getDestinations(): Promise<{ destinations: Destination[] }> {
  return request<{ destinations: Destination[] }>("/destinations");
}

// Newsletter
export async function subscribe(email: string): Promise<{ message: string }> {
  return request<{ message: string }>("/subscribe", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function unsubscribe(email: string): Promise<{ message: string }> {
  return request<{ message: string }>("/subscribe", {
    method: "DELETE",
    body: JSON.stringify({ email }),
  });
}

// Price alerts
export async function createPriceAlert(data: {
  email: string;
  departure_city?: string;
  destination_city: string;
  target_price: number;
  currency?: string;
}): Promise<PriceAlert> {
  return request<PriceAlert>("/price-alerts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getPriceAlerts(email: string): Promise<{ alerts: PriceAlert[] }> {
  return request<{ alerts: PriceAlert[] }>(`/price-alerts?email=${encodeURIComponent(email)}`);
}

export async function deletePriceAlert(id: number): Promise<{ message: string }> {
  return request<{ message: string }>(`/price-alerts/${id}`, { method: "DELETE" });
}

// ── Admin endpoints ──────────────────────────────────

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

export async function getAnalytics(): Promise<AnalyticsData> {
  return request<AnalyticsData>("/admin/analytics");
}

export async function getAdminSubscribers(): Promise<{
  subscribers: { id: number; email: string; created_at: string }[];
  total: number;
}> {
  return request("/admin/subscribers");
}
