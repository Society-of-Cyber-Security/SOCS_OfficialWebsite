"use client";

import React from "react";

interface TerminalHeaderProps {
  currentDir: string;
  onDragStart: (e: React.MouseEvent) => void;
  onClose: () => void;
  onMinimize: () => void;
}

export function TerminalHeader({ currentDir, onDragStart, onClose, onMinimize }: TerminalHeaderProps) {
  return (
    <div
      onMouseDown={onDragStart}
      className="flex items-center justify-between h-8 bg-[#0a0a0f] border border-b-0 border-primary/30 px-3 select-none"
      style={{ cursor: "move" }}
    >
      <div className="flex items-center gap-2 text-[10px]">
        <span
          className="w-2.5 h-2.5 rounded-full bg-red-500/80 cursor-pointer"
          onClick={onClose}
        />
        <span
          className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 cursor-pointer"
          onClick={onMinimize}
        />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
      </div>
      <span className="font-mono text-[10px] text-primary/60 tracking-[0.3em] uppercase select-none">
        socs@{currentDir}
      </span>
      <div className="w-12" />
    </div>
  );
}
