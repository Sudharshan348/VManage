import connectDb from "@/lib/db/mongoose";
import { asyncHandler } from "@/lib/util/apihandler";
import { ApiResponse } from "@/lib/util/apiresponse";
import { ApiError } from "@/lib/util/apierror";
import { validateRoom } from "@/lib/validation/room"; 
import { RoomService } from "@/lib/services/room";

export const POST = asyncHandler(async (req: Request) => {
  await connectDb();
  const body = await req.json();
  const validation = validateRoom(body);
  if (!validation.success) {
    throw new ApiError(400, validation.message, [validation.fieldErrors]);
  }
  const room = await RoomService.addRoom(validation.data);
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