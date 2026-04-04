type ValidationResult<T> = { success: true; data: T } | { success: false; message: string; fieldErrors: Record<string, string> };

type TicketUpdatePayload = {
  status: "open" | "in_progress" | "resolved" | "closed";
  resolvedNote?: string;
};

type AssetMaintenancePayload = {
  lastMaintenance: Date;
};

export function validateTicketUpdate(input: unknown): ValidationResult<TicketUpdatePayload> {
  const body = (input ?? {}) as Record<string, unknown>;
  const status = typeof body.status === "string" ? body.status.trim() : "";
  const resolvedNote = typeof body.resolvedNote === "string" ? body.resolvedNote.trim() : "";
  
  if (!["open", "in_progress", "resolved", "closed"].includes(status)) {
    return { success: false, message: "Validation failed", fieldErrors: { status: "Invalid status" } };
  }
  return {
    success: true,
    data: {
      status: status as TicketUpdatePayload["status"],
      ...(resolvedNote && { resolvedNote }),
    },
  };
}

export function validateAssetMaintenance(input: unknown): ValidationResult<AssetMaintenancePayload> {
  const body = (input ?? {}) as Record<string, unknown>;
  if (!body.lastMaintenance) {
    return { success: false, message: "Validation failed", fieldErrors: { lastMaintenance: "Date is required" } };
  }
  return { success: true, data: { lastMaintenance: new Date(body.lastMaintenance as string) } };
}
