"use client";

import { useEffect, useState } from "react";

import { RoomDashboard } from "@/components/room-dashboard";
import { normalizeRoomItem, type RoomDashboardItem } from "@/lib/rooms";

type ApiEnvelope<T> = {
  data?: T;
  message?: string;
};

export function AdminRoomInventoryClient() {
  const [rooms, setRooms] = useState<RoomDashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRooms() {
      try {
        const response = await fetch("/api/v1/rooms", { cache: "no-store" });
        const result = (await response.json()) as ApiEnvelope<Array<Record<string, unknown>>>;

        if (!active) return;

        if (!response.ok) {
          setError(result.message || "Unable to load rooms");
          return;
        }

        setRooms((result.data || []).map(normalizeRoomItem));
      } catch {
        if (active) {
          setError("Unable to load rooms");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadRooms();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading rooms...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        {error}
      </div>
    );
  }

  return <RoomDashboard rooms={rooms} />;
}
