import { useEffect, useRef, useState } from "react";

const computeOffset = (p: {
  rect: DOMRect;
  oldScale: number;
  newScale: number;
  clientCoord: { x: number; y: number };
  offsetCoord: { x: number; y: number };
}) => {
  const cursorX = p.clientCoord.x - p.rect.left;
  const cursorY = p.clientCoord.y - p.rect.top;

  const imgX = (cursorX - p.offsetCoord.x) / p.oldScale;
  const imgY = (cursorY - p.offsetCoord.y) / p.oldScale;

  const x = cursorX - imgX * p.newScale;
  const y = cursorY - imgY * p.newScale;

  return { x, y };
};

const zoomIncrement = 0.02; // fixed scale increment
export const ZoomableImage = (p: { src: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offsetCoord, setOffsetCoord] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;

    const onWheel = (e: WheelEvent | any) => {
      e.preventDefault();

      const direction = e.deltaY > 0 ? -1 : 1; // out vs in

      const tempScale = scale + direction * zoomIncrement;
      const newScale = tempScale < 0.2 ? 0.2 : tempScale > 8 ? 8 : tempScale;

      if (scale === newScale) return;

      const rect = c.getBoundingClientRect();

      const clientCoord = { x: e.clientX, y: e.clientY };
      const newOffsetCoord = computeOffset({
        rect,
        oldScale: scale,
        newScale,
        clientCoord,
        offsetCoord,
      });

      setOffsetCoord(newOffsetCoord);
      setScale(newScale);
    };

    c.addEventListener("wheel", onWheel, { passive: false });
    return () => c.removeEventListener("wheel", onWheel);
  }, [scale, offsetCoord]);

  return (
    <>
      <div
        ref={containerRef}
        onDoubleClick={() => {
          setScale(1);
          setOffsetCoord({ x: 0, y: 0 });
        }}
        style={{ touchAction: "none", background: "gray", overflow: "hidden" }}
      >
        <img
          src={p.src}
          alt=""
          draggable={false}
          className="select-none pointer-events-none absolute left-0 top-0"
          style={{
            transform: `translate(${offsetCoord.x}px, ${offsetCoord.y}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
        />
      </div>
      <div className="absolute left-2 top-2 bg-white/70 text-xs rounded px-2 py-1 shadow">
        Scroll to zoom • Drag to pan • Double-click to reset
      </div>
    </>
  );
};
