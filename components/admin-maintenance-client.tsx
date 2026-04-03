"use client";

import { useState } from "react";

import { AccentButton, Field, Select } from "@/components/v1-portal";

type AssetOption = {
  _id: string;
  assetType: string;
  floor: number;
  machineAge: number;
  status: string;
};

type MaintenanceResponse = {
  data?: Record<string, unknown>;
  message?: string;
};

export function AdminMaintenanceClient({ assets }: { assets: AssetOption[] }) {
  const [assetId, setAssetId] = useState(assets[0]?._id || "");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/v1/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assetId }),
      });

      const payload = (await response.json()) as MaintenanceResponse;

      if (!response.ok) {
        setError(payload.message || "Unable to calculate maintenance risk");
        return;
      }

      setResult(payload.data || null);
    } catch {
      setError("Unable to calculate maintenance risk");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Select asset">
          <Select value={assetId} onChange={(event) => setAssetId(event.target.value)} required>
            {assets.map((asset) => (
              <option key={asset._id} value={asset._id}>
                {asset.assetType} • Floor {asset.floor} • {asset.status}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex justify-end">
          <AccentButton accent="red" disabled={loading || !assetId}>
            {loading ? "Calculating..." : "Predict failure risk"}
          </AccentButton>
        </div>
      </form>

      {assets.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          No assets are available for maintenance prediction.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(result).map(([key, value]) => (
            <div key={key} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium capitalize text-slate-500">
                {key.replace(/_/g, " ")}
              </p>
              <p className="mt-2 text-sm text-slate-900">
                {typeof value === "object" ? JSON.stringify(value) : String(value)}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
