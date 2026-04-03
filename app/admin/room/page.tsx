import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { AdminRoomForm } from "@/components/admin-room-form";
import {
  RoomDashboard,
  normalizeRoomItem,
  type RoomDashboardItem,
} from "@/components/room-dashboard";
import { getCurrentUser } from "@/lib/auth";
import connectDb from "@/lib/db/mongoose";
import { Room } from "@/lib/models/room.model";
import { Panel } from "@/components/dashboard-shell";

export default async function AdminRoomPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin" && user.role !== "warden") {
    redirect("/student");
  }

  await connectDb();

  const rooms = (((await Room.find()
    .sort({ block: 1, floor: 1, roomNumber: 1 })
    .lean()) as unknown) as Array<Record<string, unknown>>).map(
    normalizeRoomItem
  ) as RoomDashboardItem[];

  return (
    <DashboardShell title="Room inventory" role="admin" userName={user.name}>
      <Panel title="Add a room">
        <AdminRoomForm />
      </Panel>
      <RoomDashboard rooms={rooms} />
    </DashboardShell>
  );
}
