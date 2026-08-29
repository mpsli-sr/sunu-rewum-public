"use client";
import { useState, useEffect } from "react";

interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
}

export default function InlineEdit({
  value,
  onSave,
  className,
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
  };

  if (editing)
    return (
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") setEditing(false);
        }}
        className={`border p-1 rounded ${className || ""}`}
        autoFocus
      />
    );
  return (
    <span
      className={`cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${className || ""}`}
      onDoubleClick={() => setEditing(true)}
      title="Double-cliquez pour modifier"
    >
      {value}
    </span>
  );
}
