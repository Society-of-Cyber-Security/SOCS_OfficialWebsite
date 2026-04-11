"use client";

export type CommandType = "input" | "output" | "error" | "system";

export interface HistoryEntry {
  type: CommandType;
  text: string;
}

export interface TerminalState {
  isOpen: boolean;
  isMinimized: boolean;
  history: HistoryEntry[];
  input: string;
  cmdHistory: string[];
  cmdHistoryIdx: number;
  pos: { x: number; y: number };
  size: { w: number; h: number };
}

export interface TerminalCommand {
  name: string;
  description: string;
  usage?: string;
  execute: (args: string[], context: CommandContext) => HistoryEntry[] | Promise<HistoryEntry[]>;
}

export interface CommandContext {
  router: any;
  pathname: string;
  themeContext: any;
  audio: any;
  setIsOpen: (open: boolean) => void;
  setHistory: (setter: (prev: HistoryEntry[]) => HistoryEntry[]) => void;
}
