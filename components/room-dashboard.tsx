"use client";

import { useMemo, useState } from "react";
import { BedDouble, Building2, Filter, Hammer, TriangleAlert } from "lucide-react";

import { DashboardCard, Panel } from "@/components/dashboard-shell";
import { Select } from "@/components/v1-portal";
import type { RoomDashboardItem } from "@/lib/rooms";
import { cn } from "@/lib/utils";
import type { RoomType } from "@/lib/rooms";

type FilterMode = "all" | "empty" | "partial" | "full";

const typeLabel: Record<RoomType, string> = {
  two: "2-Seater",
  three: "3-Seater",
  four: "4-Seater",
  six: "6-Seater",
};

function getBedsAvailable(room: RoomDashboardItem) {
  return room.capacity - room.currentOccupancy;
}

function getOccupancyLabel(room: RoomDashboardItem) {
  if (room.currentOccupancy > room.capacity) return "Data error";
  if (room.status === "maintenance") return "Maintenance";
  if (room.currentOccupancy === 0) return "Empty";
  if (room.currentOccupancy >= room.capacity) return "Fully allotted";
  return "Partially allotted";
}

function getRoomTone(room: RoomDashboardItem) {
  if (room.currentOccupancy > room.capacity) {
    return "border-red-300 bg-red-50 text-red-900";
  }

  if (room.status === "maintenance") {
    return "border-amber-300 bg-[repeating-linear-gradient(135deg,#fff7ed,#fff7ed_12px,#ffedd5_12px,#ffedd5_24px)] text-amber-950";
  }

  if (room.currentOccupancy === 0) {
    return "border-emerald-300 bg-emerald-50 text-emerald-950";
  }

  if (room.currentOccupancy >= room.capacity) {
    return "border-slate-300 bg-slate-100 text-slate-900";
  }

  return "border-orange-300 bg-orange-50 text-orange-950";
}

export function RoomDashboard({ rooms }: { rooms: RoomDashboardItem[] }) {
  const [filter, setFilter] = useState<FilterMode>("all");

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (filter === "empty") return room.currentOccupancy === 0;
      if (filter === "partial") {
        return room.currentOccupancy > 0 && room.currentOccupancy < room.capacity;
      }
      if (filter === "full") return room.currentOccupancy >= room.capacity;
      return true;
    });
  }, [filter, rooms]);

  const groupedRooms = useMemo(() => {
    return filteredRooms.reduce<Record<string, RoomDashboardItem[]>>((groups, room) => {
      const key = `${room.block} - Floor ${room.floor}`;
      groups[key] ??= [];
      groups[key].push(room);
      return groups;
    }, {});
  }, [filteredRooms]);

  const totalBedsAvailable = rooms.reduce(
    (sum, room) => sum + Math.max(0, room.capacity - room.currentOccupancy),
    0
  );
  const maintenanceCount = rooms.filter((room) => room.status === "maintenance").length;
  const dataErrors = rooms.filter((room) => room.currentOccupancy > room.capacity).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <DashboardCard title="Total rooms" value={String(rooms.length)} />
        <DashboardCard title="Available beds" value={String(totalBedsAvailable)} />
        <DashboardCard title="Maintenance rooms" value={String(maintenanceCount)} />
        <DashboardCard title="Data errors" value={String(dataErrors)} />
      </div>

      <Panel title="Live room inventory">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Filter occupancy state</p>
              <p className="text-sm text-slate-500">
                Switch between all rooms, empty rooms, partial allotments, and fully allotted rooms.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Filter className="size-4 text-slate-500" />
              <Select
                value={filter}
                onChange={(event) => setFilter(event.target.value as FilterMode)}
                className="min-w-52 bg-white"
              >
                <option value="all">All rooms</option>
                <option value="empty">Empty only</option>
                <option value="partial">Partially allotted</option>
                <option value="full">Fully allotted</option>
              </Select>
            </div>
          </div>

          {filteredRooms.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
              No rooms match the selected filter.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedRooms).map(([group, groupRooms]) => (
                <section key={group} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                      <Building2 className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">{group}</h3>
                      <p className="text-sm text-slate-500">
                        {groupRooms.length} rooms in this section
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                    {groupRooms.map((room) => {
                      const bedsAvailable = getBedsAvailable(room);
                      const overCapacity = room.currentOccupancy > room.capacity;

                      return (
                        <article
                          key={room._id}
                          className={cn(
                            "group rounded-[24px] border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                            getRoomTone(room)
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">
                                Room
                              </p>
                              <h4 className="mt-1 text-xl font-semibold">{room.roomNumber}</h4>
                            </div>
                            {room.status === "maintenance" ? (
                              <Hammer className="size-4 opacity-80" />
                            ) : overCapacity ? (
                              <TriangleAlert className="size-4 opacity-80" />
                            ) : (
                              <BedDouble className="size-4 opacity-80" />
                            )}
                          </div>

                          <div className="mt-4 space-y-2 text-sm">
                            <p className="font-medium">{getOccupancyLabel(room)}</p>
                            <p>
                              {room.currentOccupancy}/{room.capacity} occupied
                            </p>
                            <p>{typeLabel[room.type]}</p>
                          </div>

                          <div className="mt-4 rounded-2xl bg-white/70 px-3 py-3 text-sm shadow-sm">
                            <p className="font-medium text-slate-900">
                              Beds available: {bedsAvailable < 0 ? 0 : bedsAvailable}
                            </p>
                            <p className="mt-1 text-slate-600">
                              Amenities: {room.amenities.length ? room.amenities.join(", ") : "None"}
                            </p>
                            {overCapacity ? (
                              <p className="mt-2 font-medium text-red-700">
                                Current occupancy exceeds capacity.
                              </p>
                            ) : null}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
