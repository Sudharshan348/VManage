import { RoomRepository } from "@/lib/repositories/room";
import { RoomInput } from "@/lib/validation/room";
import { ApiError } from "@/lib/util/apierror";

export class RoomService {
  static async addRoom(data: RoomInput) {
    const existingRoom = await RoomRepository.findByRoomNumber(data.roomNumber);
    
    if (existingRoom) {
      throw new ApiError(409, "Room number already exists in the system");
    }
    
    const newRoom = await RoomRepository.create(data);
    return newRoom;
  }

  static async getAllRooms() {
    const rooms = await RoomRepository.findAll();
    return rooms;
  }
}
