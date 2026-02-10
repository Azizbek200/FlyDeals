"use client";

import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import DealForm from "@/components/DealForm";
import { createDeal, CreateDealInput } from "@/lib/api";

export default function AdminNewDealPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateDealInput) => {
    await createDeal(data);
    router.push("/admin/deals");
  };

  return (
    <>
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Create New Deal
        </h1>
        <DealForm onSubmit={handleSubmit} />
      </div>
    </>
  );
}
