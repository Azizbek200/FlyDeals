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

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
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
): Promise<{ message: string }> {
  return request<{ message: string }>("/admin/login", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
}

export async function getAdminDeals(
  page = 1,
  limit = 50
): Promise<DealsResponse> {
  return request<DealsResponse>(`/admin/deals?page=${page}&limit=${limit}`, {
    credentials: "include",
  });
}

export async function createDeal(data: CreateDealInput): Promise<Deal> {
  return request<Deal>("/admin/deals", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(data),
  });
}

export async function updateDeal(
  id: number,
  data: UpdateDealInput
): Promise<Deal> {
  return request<Deal>(`/admin/deals/${id}`, {
    method: "PUT",
    credentials: "include",
    body: JSON.stringify(data),
  });
}

export async function deleteDeal(id: number): Promise<{ message: string }> {
  return request<{ message: string }>(`/admin/deals/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
}
