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

const clamp = (p: { value: number; min: number; max: number }) =>
  Math.min(Math.max(p.value, p.min), p.max);

const clampOffset = (p: {
  offset: TCoord;
  scale: number;
  imageSize: { width: number; height: number };
  containerSize: { width: number; height: number };
}) => {
  const maxX = 0; // image left edge cannot go past container left
  const maxY = 0; // image top edge cannot go past container top

  const minX = Math.min(p.containerSize.width - p.imageSize.width * p.scale, 0); // image right edge cannot go past container right
  const minY = Math.min(p.containerSize.height - p.imageSize.height * p.scale, 0); // bottom edge

  return {
    x: clamp({ value: p.offset.x, min: minX, max: maxX }),
    y: clamp({ value: p.offset.y, min: minY, max: maxY }),
  };
};

type TCoord = { x: number; y: number };
const zoomIncrement = 0.08; // fixed scale increment
export const ZoomableImage = (p: {
  src: string;
  onScaleChange: (scale: number) => void;
  onOffsetChange: (coord: TCoord) => void;
  onNaturalDimensionsChange: (dimensions: { width: number; height: number }) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [naturalImageDimensions, setNaturalImageDimensions] = useState({ height: 0, width: 0 });
  const [offsetCoord, setOffsetCoord] = useState({ x: 0, y: 0 });

  useEffect(() => p.onScaleChange(scale), [scale]);
  useEffect(() => p.onOffsetChange(offsetCoord), [offsetCoord]);
  useEffect(() => p.onNaturalDimensionsChange(naturalImageDimensions), [naturalImageDimensions]);

  const zoom = (p: { direction: 1 | -1; rect: DOMRect; clientCoord: { x: number; y: number } }) => {
    const tempScale = scale + p.direction * zoomIncrement;
    const newScale = tempScale < 0.2 ? 0.2 : tempScale > 8 ? 8 : tempScale;

    if (scale === newScale) return;

    const newOffsetCoord = computeOffset({
      rect: p.rect,
      oldScale: scale,
      newScale,
      clientCoord: p.clientCoord,
      offsetCoord,
    });

    setOffsetCoord(newOffsetCoord);
    setScale(newScale);
  };

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        const direction = e.deltaY > 0 ? -1 : 1;
        zoom({
          direction,
          rect: c.getBoundingClientRect(),
          clientCoord: { x: e.clientX, y: e.clientY },
        });
      } else {
        setOffsetCoord((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    };

    c.addEventListener("wheel", onWheel, { passive: false });
    return () => c.removeEventListener("wheel", onWheel);
  }, [scale, offsetCoord]);

  return (
    <>
      <div
        ref={containerRef}
        style={{
          touchAction: "none",
          background: "gray",
          overflow: "hidden",
          width: "100%",
          overflowX: "scroll",
        }}
      >
        <img
          onLoad={(e) => {
            const height = e.currentTarget.naturalHeight;
            const width = e.currentTarget.naturalWidth;
            setNaturalImageDimensions({ height, width });
          }}
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
    </>
  );
};
