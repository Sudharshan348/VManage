"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AccentButton, Field, FormGrid, Input, Select } from "@/components/v1-portal";

type RoomResponse = {
  message?: string;
  errors?: Array<Record<string, string>> | Record<string, string>;
};

const roomTypeOptions = [
  { value: "two", label: "2-Seater", capacity: 2 },
  { value: "three", label: "3-Seater", capacity: 3 },
  { value: "four", label: "4-Seater", capacity: 4 },
  { value: "six", label: "6-Seater", capacity: 6 },
] as const;

export function AdminRoomForm() {
  const router = useRouter();
  const [roomNumber, setRoomNumber] = useState("");
  const [block, setBlock] = useState("");
  const [floor, setFloor] = useState(0);
  const [type, setType] = useState<(typeof roomTypeOptions)[number]["value"]>("two");
  const [amenities, setAmenities] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const selectedType = roomTypeOptions.find((option) => option.value === type)!;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setErrors({});

    try {
      const response = await fetch("/api/v1/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomNumber,
          block,
          floor,
          type,
          capacity: selectedType.capacity,
          amenities: amenities
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });

      const result = (await response.json()) as RoomResponse;

      if (!response.ok) {
        const nextErrors = Array.isArray(result.errors)
          ? (result.errors[0] ?? {})
          : (result.errors ?? {});
        setErrors(nextErrors);
        setMessage(result.message || "Unable to create room");
        return;
      }

      setRoomNumber("");
      setBlock("");
      setFloor(0);
      setType("two");
      setAmenities("");
      setMessage("Room created successfully");
      router.refresh();
    } catch {
      setMessage("Unable to create room");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <FormGrid>
        <Field label="Room number">
          <div className="space-y-2">
            <Input
              value={roomNumber}
              onChange={(event) => setRoomNumber(event.target.value)}
              placeholder="A-101"
              required
            />
            {errors.roomNumber ? <p className="text-xs text-red-600">{errors.roomNumber}</p> : null}
          </div>
        </Field>
        <Field label="Block">
          <div className="space-y-2">
            <Input
              value={block}
              onChange={(event) => setBlock(event.target.value)}
              placeholder="A"
              required
            />
            {errors.block ? <p className="text-xs text-red-600">{errors.block}</p> : null}
          </div>
        </Field>
        <Field label="Floor">
          <div className="space-y-2">
            <Input
              type="number"
              min={0}
              value={floor}
              onChange={(event) => setFloor(Number(event.target.value) || 0)}
              required
            />
            {errors.floor ? <p className="text-xs text-red-600">{errors.floor}</p> : null}
          </div>
        </Field>
        <Field label="Room type">
          <Select value={type} onChange={(event) => setType(event.target.value as typeof type)}>
            {roomTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Capacity">
          <Input value={selectedType.capacity} readOnly />
        </Field>
        <Field label="Amenities" hint="Comma-separated">
          <Input
            value={amenities}
            onChange={(event) => setAmenities(event.target.value)}
            placeholder="Wi-Fi, Study table, Balcony"
          />
        </Field>
      </FormGrid>

      {message ? (
        <div
          className={
            Object.keys(errors).length > 0
              ? "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              : "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          }
        >
          {message}
        </div>
      ) : null}

      <div className="flex justify-end border-t border-slate-200 pt-5">
        <AccentButton accent="red" disabled={loading}>
          {loading ? "Creating..." : "Create room"}
        </AccentButton>
      </div>
    </form>
  );
}
