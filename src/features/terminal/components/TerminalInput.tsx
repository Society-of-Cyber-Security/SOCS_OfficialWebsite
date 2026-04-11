"use client";

import React, { useCallback } from "react";

interface TerminalInputProps {
  input: string;
  setInput: (v: string) => void;
  currentDir: string;
  onCommand: (cmd: string) => void;
  cmdHistory: string[];
  setCmdHistory: (hist: (prev: string[]) => string[]) => void;
  cmdHistoryIdx: number;
  setCmdHistoryIdx: (idx: (prev: number) => number) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  playType: () => void;
}

export function TerminalInput({
  input,
  setInput,
  currentDir,
  onCommand,
  cmdHistory,
  setCmdHistory,
  cmdHistoryIdx,
  setCmdHistoryIdx,
  inputRef,
  playType,
}: TerminalInputProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onCommand(input);
        if (input.trim()) {
          setCmdHistory((prev) => [input, ...prev]);
        }
        setCmdHistoryIdx(() => -1);
        setInput("");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCmdHistoryIdx((prev) => {
          const next = Math.min(prev + 1, cmdHistory.length - 1);
          if (cmdHistory[next]) setInput(cmdHistory[next]);
          return next;
        });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setCmdHistoryIdx((prev) => {
          const next = Math.max(prev - 1, -1);
          setInput(next < 0 ? "" : cmdHistory[next] || "");
          return next;
        });
      }
    },
    [input, cmdHistory, onCommand, setCmdHistory, setCmdHistoryIdx, setInput]
  );

  return (
    <div className="flex items-center mt-1">
      <span className="text-primary/70 mr-2 shrink-0">socs@{currentDir} ~$</span>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          playType();
        }}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent text-primary outline-none border-none caret-primary font-mono text-[13px]"
        spellCheck={false}
        autoComplete="off"
        autoFocus
      />
    </div>
  );
}
