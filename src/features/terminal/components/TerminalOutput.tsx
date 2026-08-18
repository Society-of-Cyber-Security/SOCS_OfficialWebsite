"use client";

import React from "react";
import { HistoryEntry } from "../types";

interface TerminalOutputProps {
  history: HistoryEntry[];
}

export function TerminalOutput({ history }: TerminalOutputProps) {
  const renderLine = (entry: HistoryEntry, i: number) => {
    const colorMatch = entry.text.match(/→\s*(#[0-9a-fA-F]{3,8}|[a-z]+\([^)]+\)|[a-z]{3,})\s*$/);
    return (
      <div
        key={i}
        className={`whitespace-pre-wrap flex items-start gap-1 ${
          entry.type === "input"
            ? "text-[var(--color-cyber-neon)]"
            : entry.type === "error"
              ? "text-red-600"
              : entry.type === "system"
                ? "text-[var(--color-cyber-muted)]"
                : "text-[var(--color-cyber-white)]"
        }`}
      >
        <span>{entry.text}</span>
        {colorMatch && entry.type === "system" && (
          <span
            className="inline-block w-3 h-3 rounded-sm shrink-0 mt-[3px] border border-[var(--color-cyber-gray)]"
            style={{ backgroundColor: colorMatch[1] }}
          />
        )}
      </div>
    );
  };

  return (
    <>
      {history.map((entry, i) => renderLine(entry, i))}
    </>
  );
}
