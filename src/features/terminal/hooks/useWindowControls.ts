"use client";

import { useCallback, useRef } from "react";

export function useWindowControls(
  pos: { x: number; y: number },
  setPos: (p: { x: number; y: number }) => void,
  size: { w: number; h: number },
  setSize: (s: { w: number; h: number }) => void
) {
  const dragging = useRef(false);
  const resizing = useRef(false);

  const onDragStart = useCallback(
    (e: React.MouseEvent) => {
      const startX = e.clientX;
      const startY = e.clientY;
      const initialPos = { x: pos.x, y: pos.y };

      dragging.current = true;
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";

      const onMove = (ev: MouseEvent) => {
        if (!dragging.current) return;
        setPos({
          x: Math.max(0, Math.min(window.innerWidth - 100, initialPos.x + ev.clientX - startX)),
          y: Math.max(0, Math.min(window.innerHeight - 40, initialPos.y + ev.clientY - startY)),
        });
      };

      const onUp = () => {
        dragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [pos.x, pos.y, setPos]
  );

  const onResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;
      const initialSize = { w: size.w, h: size.h };

      resizing.current = true;
      document.body.style.cursor = "nwse-resize";
      document.body.style.userSelect = "none";

      const onMove = (ev: MouseEvent) => {
        if (!resizing.current) return;
        setSize({
          w: Math.max(380, initialSize.w + ev.clientX - startX),
          h: Math.max(200, initialSize.h + ev.clientY - startY),
        });
      };

      const onUp = () => {
        resizing.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [size.w, size.h, setSize]
  );

  return { onDragStart, onResizeStart };
}
