export type RoomStatus = "available" | "full" | "maintenance";
export type RoomType = "two" | "three" | "four" | "six";

export type RoomDashboardItem = {
  _id: string;
  roomNumber: string;
  block: string;
  floor: number;
  type: RoomType;
  capacity: number;
  currentOccupancy: number;
  status: RoomStatus;
  amenities: string[];
};

export function normalizeRoomItem(
  room: RoomDashboardItem | Record<string, unknown>
): RoomDashboardItem {
  return {
    _id: String(room._id ?? ""),
    roomNumber: String(room.roomNumber ?? ""),
    block: String(room.block ?? ""),
    floor: Number(room.floor ?? 0),
    type: String(room.type ?? "two") as RoomType,
    capacity: Number(room.capacity ?? 0),
    currentOccupancy: Number(room.currentOccupancy ?? 0),
    status: String(room.status ?? "available") as RoomStatus,
    amenities: Array.isArray(room.amenities)
      ? room.amenities.map((item) => String(item))
      : [],
  };
}
