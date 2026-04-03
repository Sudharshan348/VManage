import { Room, IRoom } from "@/lib/models/room.model";
import { RoomInput } from "@/lib/validation/room";

export class RoomRepository {
  static async findByRoomNumber(roomNumber: string): Promise<IRoom | null> {
    return Room.findOne({ roomNumber });
  }

  static async create(data: RoomInput): Promise<IRoom> {
    return Room.create(data);
  }

  static async findAll(): Promise<IRoom[]> {
    return Room.find().sort({ block: 1, roomNumber: 1 });
  }
}
