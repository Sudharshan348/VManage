import { z } from "zod";

export const createRoomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  block: z.string().min(1, "Block is required"),
  floor: z.number().min(0, "Floor cannot be negative"),
  type: z.enum(["two", "three", "four", "six"]),
  capacity: z.number().min(2),
  amenities: z.array(z.string()).optional().default([]),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;