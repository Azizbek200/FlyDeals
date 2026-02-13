"use client";

import { useState } from "react";
import { CreateDealInput } from "@/lib/api";

interface DealFormProps {
  initialData?: Partial<CreateDealInput>;
  onSubmit: (data: CreateDealInput) => Promise<void>;
  isEditing?: boolean;
}

export default function DealForm({
  initialData,
  onSubmit,
  isEditing = false,
}: DealFormProps) {
  const [form, setForm] = useState<CreateDealInput>({
    title: initialData?.title || "",
    departure_city: initialData?.departure_city || "",
    destination_city: initialData?.destination_city || "",
    price: initialData?.price || 0,
    currency: initialData?.currency || "EUR",
    travel_dates: initialData?.travel_dates || "",
    affiliate_url: initialData?.affiliate_url || "",
    content: initialData?.content || "",
    image_url: initialData?.image_url || "",
    published: initialData?.published || false,
    original_price: initialData?.original_price || undefined,
    expires_at: initialData?.expires_at || "",
    scheduled_at: initialData?.scheduled_at || "",
    tags: initialData?.tags || [],
  });
  const [tagsInput, setTagsInput] = useState((initialData?.tags || []).join(", "));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.departure_city || !form.destination_city || !form.price) {
      setError("Title, departure city, destination city, and price are required.");
      return;
    }

    // Parse tags from comma-separated input
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setLoading(true);
    try {
      await onSubmit({ ...form, tags });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g. Cheap flights to Barcelona"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Departure City *
          </label>
          <input
            type="text"
            value={form.departure_city}
            onChange={(e) =>
              setForm({ ...form, departure_city: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. London"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination City *
          </label>
          <input
            type="text"
            value={form.destination_city}
            onChange={(e) =>
              setForm({ ...form, destination_city: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. Barcelona"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price *
          </label>
          <input
            type="number"
            value={form.price || ""}
            onChange={(e) =>
              setForm({ ...form, price: parseInt(e.target.value) || 0 })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. 49"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Original Price
          </label>
          <input
            type="number"
            value={form.original_price || ""}
            onChange={(e) =>
              setForm({ ...form, original_price: parseInt(e.target.value) || undefined })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. 299"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Travel Dates
        </label>
        <input
          type="text"
          value={form.travel_dates}
          onChange={(e) => setForm({ ...form, travel_dates: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g. March 2026 - May 2026"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expires At
          </label>
          <input
            type="datetime-local"
            value={form.expires_at ? form.expires_at.slice(0, 16) : ""}
            onChange={(e) =>
              setForm({ ...form, expires_at: e.target.value ? new Date(e.target.value).toISOString() : "" })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Schedule Publish
          </label>
          <input
            type="datetime-local"
            value={form.scheduled_at ? form.scheduled_at.slice(0, 16) : ""}
            onChange={(e) =>
              setForm({ ...form, scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : "" })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags <span className="text-gray-400 font-normal">(comma-separated)</span>
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g. Error Fare, Weekend Getaway, Business Class"
        />
        {tagsInput && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tagsInput.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
              <span key={t} className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-600">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Affiliate URL
        </label>
        <input
          type="url"
          value={form.affiliate_url}
          onChange={(e) => setForm({ ...form, affiliate_url: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URL
        </label>
        <input
          type="url"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://... (optional, will use placeholder if empty)"
        />
        {form.image_url && (
          <div className="mt-2">
            <img
              src={form.image_url}
              alt="Preview"
              className="h-32 w-full object-cover rounded-md"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/400x300?text=Invalid+Image";
              }}
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content (Markdown)
        </label>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={10}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
          placeholder="Write deal details in markdown..."
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="published"
          checked={form.published}
          onChange={(e) => setForm({ ...form, published: e.target.checked })}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="published" className="text-sm text-gray-700">
          Published
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? "Saving..."
          : isEditing
            ? "Update Deal"
            : "Create Deal"}
      </button>
    </form>
  );
}
