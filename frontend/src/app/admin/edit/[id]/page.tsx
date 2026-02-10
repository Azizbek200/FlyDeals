"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import DealForm from "@/components/DealForm";
import {
  Deal,
  getAdminDeals,
  updateDeal,
  CreateDealInput,
} from "@/lib/api";

export default function AdminEditDealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const data = await getAdminDeals(1, 100);
        const found = data.deals.find((d) => d.id === parseInt(id));
        if (!found) {
          setError("Deal not found");
        } else {
          setDeal(found);
        }
      } catch (err) {
        if (err instanceof Error && "status" in err && (err as { status: number }).status === 401) {
          router.push("/admin/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load deal");
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [id, router]);

  const handleSubmit = async (data: CreateDealInput) => {
    await updateDeal(parseInt(id), data);
    router.push("/admin/deals");
  };

  return (
    <>
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Deal</h1>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded text-sm mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading deal...</p>
        ) : deal ? (
          <DealForm initialData={deal} onSubmit={handleSubmit} isEditing />
        ) : null}
      </div>
    </>
  );
}
