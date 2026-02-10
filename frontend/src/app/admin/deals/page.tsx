"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminNav from "@/components/AdminNav";
import { Deal, getAdminDeals, updateDeal, deleteDeal } from "@/lib/api";

export default function AdminDealsPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDeals = async () => {
    try {
      const data = await getAdminDeals(1, 100);
      setDeals(data.deals);
    } catch (err) {
      if (err instanceof Error && "status" in err && (err as { status: number }).status === 401) {
        router.push("/admin/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleTogglePublished = async (deal: Deal) => {
    try {
      await updateDeal(deal.id, { published: !deal.published });
      setDeals((prev) =>
        prev.map((d) =>
          d.id === deal.id ? { ...d, published: !d.published } : d
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update deal");
    }
  };

  const handleDelete = async (deal: Deal) => {
    if (!confirm(`Delete "${deal.title}"?`)) return;

    try {
      await deleteDeal(deal.id);
      setDeals((prev) => prev.filter((d) => d.id !== deal.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete deal");
    }
  };

  return (
    <>
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">All Deals</h1>
          <Link
            href="/admin/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            + New Deal
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded text-sm mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-center py-12">Loading deals...</p>
        ) : deals.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            No deals yet.{" "}
            <Link href="/admin/new" className="text-blue-600 hover:underline">
              Create your first deal
            </Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-3 font-medium text-gray-500">Title</th>
                  <th className="pb-3 font-medium text-gray-500">Route</th>
                  <th className="pb-3 font-medium text-gray-500">Price</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr
                    key={deal.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 pr-4 font-medium text-gray-900">
                      {deal.title}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {deal.departure_city} &rarr; {deal.destination_city}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {deal.currency} {deal.price}
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => handleTogglePublished(deal)}
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          deal.published
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {deal.published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="py-3 text-right space-x-3">
                      <Link
                        href={`/admin/edit/${deal.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(deal)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
