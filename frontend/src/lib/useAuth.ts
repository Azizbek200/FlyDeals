"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function useAuth() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    // Validate token against the backend
    fetch(`${API_URL}/admin/deals?page=1&limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) {
          setAuthenticated(true);
        } else {
          clearToken();
          router.replace("/admin/login");
        }
      })
      .catch(() => {
        clearToken();
        router.replace("/admin/login");
      });
  }, [router]);

  return authenticated;
}
