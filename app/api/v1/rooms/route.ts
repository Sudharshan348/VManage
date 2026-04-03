import connectDb from "@/lib/db/mongoose";
import { asyncHandler } from "@/lib/util/apihandler";
import { ApiResponse } from "@/lib/util/apiresponse";
import { ApiError } from "@/lib/util/apierror";
import { createRoomSchema } from "@/lib/validation/room";
import { RoomService } from "@/lib/services/room";

export const POST = asyncHandler(async (req: Request) => {
  await connectDb();
  
  const body = await req.json();
  const parsedData = createRoomSchema.safeParse(body);
  
  if (!parsedData.success) {
    throw new ApiError(400, "Invalid room data", parsedData.error.issues);
  }
  
  const room = await RoomService.addRoom(parsedData.data);
  
  return Response.json(
    new ApiResponse(201, room, "Room created successfully"),
    { status: 201 }
  );
});

export const GET = asyncHandler(async (req: Request) => {
  await connectDb();
  
  const rooms = await RoomService.getAllRooms();
  
  return Response.json(
    new ApiResponse(200, rooms, "Rooms fetched successfully"),
    { status: 200 }
  );
});