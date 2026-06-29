"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

interface Props {
  id: number;
  currentOwner: string | null;
}

export default function OwnerInput({ id, currentOwner }: Props) {
  const router = useRouter();
  const [value, setValue] = useState<string>(currentOwner ?? "");
  const [error, setError] = useState<string | null>(null);
  const lastSaved = useRef<string>(currentOwner ?? "");

  async function save() {
    const trimmed = value.trim();
    if (trimmed === lastSaved.current) return;

    setError(null);
    const prev = lastSaved.current;
    const body = { owner: trimmed === "" ? null : trimmed };
    const res = await fetch(`/api/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      setValue(prev);
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Failed to update owner");
      return;
    }

    lastSaved.current = trimmed;
    router.refresh();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  }

  return (
    <span className="flex flex-col gap-1">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        placeholder="—"
        className="rounded border border-gray-200 px-2 py-1 text-sm bg-white w-36"
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </span>
  );
}
