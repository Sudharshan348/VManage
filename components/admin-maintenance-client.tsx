"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AccentButton, Field, FormGrid, Input, Select } from "@/components/v1-portal";

type AssetOption = {
  _id: string;
  assetType: string;
  floor: number;
  machineAge: number;
  status: string;
  lastMaintenance: string;
};

type ExistingIssue = {
  _id: string;
  assetIdentifier: string;
  assetType: string;
  floorLevel: number;
  ageMonths: number;
  daysSinceService: number;
  riskScore: number;
  status: string;
  fatal: boolean;
  createdAt: string;
};

type MaintenanceResponse = {
  data?: {
    asset_type?: string;
    asset_identifier?: string;
    probability_score?: number;
    usage_load?: number;
    alert_required?: boolean;
    fatal?: boolean;
    taskCreated?: boolean;
    storedMaintenanceIssue?: boolean;
  };
  message?: string;
};

function getDaysSince(dateText: string) {
  const parsed = new Date(dateText);
  if (Number.isNaN(parsed.getTime())) return 0;
  const diff = Date.now() - parsed.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(dateText: string) {
  const parsed = new Date(dateText);
  if (Number.isNaN(parsed.getTime())) return dateText;
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminMaintenanceClient({
  assets,
  existingIssues,
}: {
  assets: AssetOption[];
  existingIssues: ExistingIssue[];
}) {
  const router = useRouter();
  const initialAsset = assets[0];

  const [selectedAssetId, setSelectedAssetId] = useState(initialAsset?._id || "");
  const [assetIdentifier, setAssetIdentifier] = useState(initialAsset?._id || "");
  const [assetType, setAssetType] = useState(initialAsset?.assetType || "AC");
  const [ageMonths, setAgeMonths] = useState(String(initialAsset?.machineAge ?? ""));
  const [daysSinceService, setDaysSinceService] = useState(
    initialAsset ? String(getDaysSince(initialAsset.lastMaintenance)) : ""
  );
  const [floorLevel, setFloorLevel] = useState(String(initialAsset?.floor ?? ""));
  const [result, setResult] = useState<MaintenanceResponse["data"] | null>(null);
  const [storedIssues, setStoredIssues] = useState(existingIssues);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedAsset = useMemo(
    () => assets.find((asset) => asset._id === selectedAssetId) || null,
    [assets, selectedAssetId]
  );

  function handleAssetPrefill(nextAssetId: string) {
    setSelectedAssetId(nextAssetId);
    const asset = assets.find((item) => item._id === nextAssetId);
    if (!asset) {
      return;
    }

    setAssetIdentifier(asset._id);
    setAssetType(asset.assetType);
    setAgeMonths(String(asset.machineAge));
    setDaysSinceService(String(getDaysSince(asset.lastMaintenance)));
    setFloorLevel(String(asset.floor));
  }

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
        body: JSON.stringify({
          assetId: selectedAssetId || undefined,
          assetIdentifier,
          assetType,
          ageMonths: Number(ageMonths),
          daysSinceService: Number(daysSinceService),
          floorLevel: Number(floorLevel),
        }),
      });

      const payload = (await response.json()) as MaintenanceResponse;

      if (!response.ok) {
        setError(payload.message || "Unable to calculate maintenance risk");
        return;
      }

      setResult(payload.data || null);

      if (payload.data?.fatal && payload.data.taskCreated) {
        const createdIssue: ExistingIssue = {
          _id: `${payload.data.asset_identifier}-${Date.now()}`,
          assetIdentifier: payload.data.asset_identifier || assetIdentifier,
          assetType: payload.data.asset_type || assetType,
          floorLevel: Number(floorLevel),
          ageMonths: Number(ageMonths),
          daysSinceService: Number(daysSinceService),
          riskScore: Number(payload.data.probability_score || 0),
          status: "pending",
          fatal: true,
          createdAt: new Date().toISOString(),
        };
        setStoredIssues((current) => [createdIssue, ...current].slice(0, 10));
      }

      router.refresh();
    } catch {
      setError("Unable to calculate maintenance risk");
    } finally {
      setLoading(false);
    }
  }

  const probability = Number(result?.probability_score || 0);
  const riskTone = probability >= 75 ? "text-red-700" : probability >= 50 ? "text-amber-700" : "text-emerald-700";
  const riskPanel = probability >= 75 ? "border-red-200 bg-red-50" : probability >= 50 ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50";

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-sky-50 p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              ML Maintenance Checker
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Check an asset before it becomes a hostel outage
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Admins can prefill from an existing asset or enter the exact values required by the prediction model.
              Only fatal or high-risk results are stored as maintenance issues.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">Saved assets</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{assets.length}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">Stored fatal issues</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{storedIssues.length}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">Prefilled asset</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {selectedAsset ? `${selectedAsset.assetType} • Floor ${selectedAsset.floor}` : "Manual"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <form className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Prediction inputs</h3>
              <p className="text-sm text-slate-500">These fields map directly to your FastAPI model input.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Admin only
            </span>
          </div>

          <Field label="Use saved asset for prefill" hint="Optional">
            <Select value={selectedAssetId} onChange={(event) => handleAssetPrefill(event.target.value)}>
              <option value="">Manual entry</option>
              {assets.map((asset) => (
                <option key={asset._id} value={asset._id}>
                  {asset.assetType} • Floor {asset.floor} • {asset.status}
                </option>
              ))}
            </Select>
          </Field>

          <FormGrid>
            <Field label="Asset ID">
              <Input
                value={assetIdentifier}
                onChange={(event) => setAssetIdentifier(event.target.value)}
                placeholder="AC-12 or database id"
                required
              />
            </Field>
            <Field label="Asset type">
              <Select value={assetType} onChange={(event) => setAssetType(event.target.value)} required>
                <option value="AC">AC</option>
                <option value="Geyser">Geyser</option>
                <option value="Water Cooler">Water Cooler</option>
              </Select>
            </Field>
            <Field label="Age in months">
              <Input
                type="number"
                min="0"
                value={ageMonths}
                onChange={(event) => setAgeMonths(event.target.value)}
                placeholder="24"
                required
              />
            </Field>
            <Field label="Days since service">
              <Input
                type="number"
                min="0"
                value={daysSinceService}
                onChange={(event) => setDaysSinceService(event.target.value)}
                placeholder="90"
                required
              />
            </Field>
            <Field label="Floor level">
              <Input
                type="number"
                min="0"
                value={floorLevel}
                onChange={(event) => setFloorLevel(event.target.value)}
                placeholder="5"
                required
              />
            </Field>
            <Field label="Estimated usage load">
              <Input
                value={assetType === "AC" ? "108" : "5"}
                readOnly
              />
            </Field>
          </FormGrid>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end border-t border-slate-200 pt-5">
            <AccentButton accent="red" disabled={loading}>
              {loading ? "Checking..." : "Run failure prediction"}
            </AccentButton>
          </div>
        </form>

        <div className="space-y-4">
          <div className={`rounded-[28px] border p-6 shadow-sm ${result ? riskPanel : "border-slate-200 bg-slate-50"}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Prediction result</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  {result ? (result.fatal ? "Fatal maintenance risk detected" : "Asset currently stable") : "No prediction yet"}
                </h3>
              </div>
              {result ? (
                <div className={`text-right ${riskTone}`}>
                  <p className="text-3xl font-bold">{probability.toFixed(2)}%</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                    Failure probability
                  </p>
                </div>
              ) : null}
            </div>

            {result ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/80 bg-white/70 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500">Asset</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {result.asset_identifier} • {result.asset_type}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/70 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500">Storage action</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {result.fatal
                      ? result.taskCreated
                        ? "Stored in maintenance issues"
                        : "Already exists in maintenance issues"
                      : "Not stored because issue is not fatal"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/70 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500">Usage load used</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{result.usage_load}</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/70 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500">Alert required</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {result.alert_required ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                Submit the checker form to see the failure probability and whether the result should be stored as a maintenance issue.
              </p>
            )}
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">Stored maintenance issues</p>
            <h3 className="mt-2 text-lg font-semibold">Fatal issues only</h3>
            <p className="mt-2 text-sm text-slate-300">
              Student complaints are not shown here. This list is reserved for ML-flagged preventive maintenance cases.
            </p>

            {storedIssues.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300">
                No fatal maintenance issues have been stored yet.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {storedIssues.map((issue) => (
                  <article key={issue._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-white">
                          {issue.assetIdentifier} • {issue.assetType}
                        </h4>
                        <p className="mt-1 text-xs text-slate-300">
                          Floor {issue.floorLevel} • Age {issue.ageMonths} months • Service gap {issue.daysSinceService} days
                        </p>
                      </div>
                      <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-200">
                        {issue.riskScore.toFixed(2)}%
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-300">
                      <span>Status: {issue.status}</span>
                      <span>{formatDate(issue.createdAt)}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
