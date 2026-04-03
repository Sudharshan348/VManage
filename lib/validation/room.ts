export type RoomType = "two" | "three" | "four" | "six";

export type RoomInput = {
  roomNumber: string;
  block: string;
  floor: number;
  type: RoomType;
  capacity: number;
  amenities?: string[];
};

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; fieldErrors: Record<string, string> };

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateRoom(input: unknown): ValidationResult<RoomInput> {
  const body = (input ?? {}) as Record<string, unknown>;
  const fieldErrors: Record<string, string> = {};

  const roomNumber = normalizeText(body.roomNumber).toUpperCase();
  const block = normalizeText(body.block).toUpperCase();
  const floor = Number(body.floor);
  const capacity = Number(body.capacity);
  const type = normalizeText(body.type).toLowerCase() as RoomType;

  // Safely handle arrays
  let amenities: string[] = [];
  if (Array.isArray(body.amenities)) {
    amenities = body.amenities.map(normalizeText).filter((a) => a.length > 0);
  }

  // Validations
  if (roomNumber.length < 1) fieldErrors.roomNumber = "Room number is required";
  if (block.length < 1) fieldErrors.block = "Block is required";

  if (!Number.isInteger(floor) || floor < 0) {
    fieldErrors.floor = "Floor must be 0 or a positive integer";
  }

  const validTypes = ["two", "three", "four", "six"];
  if (!validTypes.includes(type)) {
    fieldErrors.type = "Type must be two, three, four, or six";
  }

  if (!Number.isInteger(capacity) || capacity < 2) {
    fieldErrors.capacity = "Capacity must be an integer of at least 2";
  }

  // Optional: Sanity check ensuring capacity matches the room type
  if (type === "two" && capacity !== 2) fieldErrors.capacity = "Capacity must be 2 for a two-seater";
  if (type === "three" && capacity !== 3) fieldErrors.capacity = "Capacity must be 3 for a three-seater";
  if (type === "four" && capacity !== 4) fieldErrors.capacity = "Capacity must be 4 for a four-seater";
  if (type === "six" && capacity !== 6) fieldErrors.capacity = "Capacity must be 6 for a six-seater";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      message: "Please correct the highlighted fields",
      fieldErrors,
    };
  }

  return {
    success: true,
    data: {
      roomNumber,
      block,
      floor,
      type,
      capacity,
      ...(amenities.length > 0 ? { amenities } : {}),
    },
  };
}