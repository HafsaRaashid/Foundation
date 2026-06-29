"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Priority = "P0" | "P1" | "P2" | null;

interface Props {
  id: number;
  currentPriority: Priority;
}

export default function PrioritySelector({ id, currentPriority }: Props) {
  const router = useRouter();
  const [value, setValue] = useState<string>(currentPriority ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    const prev = value;
    setValue(next);
    setError(null);

    const body = { priority: next === "" ? null : next };
    const res = await fetch(`/api/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      setValue(prev);
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Failed to update priority");
      return;
    }

    router.refresh();
  }

  return (
    <span className="flex flex-col gap-1">
      <select
        value={value}
        onChange={handleChange}
        className="rounded border border-gray-200 px-2 py-1 text-sm bg-white"
      >
        <option value="">Untagged</option>
        <option value="P0">P0</option>
        <option value="P1">P1</option>
        <option value="P2">P2</option>
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </span>
  );
}
