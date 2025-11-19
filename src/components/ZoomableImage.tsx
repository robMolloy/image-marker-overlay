import { useEffect, useRef, useState } from "react";

type TCoord = { x: number; y: number };

const zoomIncrement = 0.08;

const clamp = (p: { value: number; min: number; max: number }) =>
  Math.min(Math.max(p.value, p.min), p.max);

const computeOffset = (p: {
  rect: DOMRect;
  oldScale: number;
  newScale: number;
  clientCoord: { x: number; y: number };
  offsetCoord: TCoord;
}) => {
  const cursorX = p.clientCoord.x - p.rect.left;
  const cursorY = p.clientCoord.y - p.rect.top;

  const imgX = (cursorX - p.offsetCoord.x) / p.oldScale;
  const imgY = (cursorY - p.offsetCoord.y) / p.oldScale;

  const x = cursorX - imgX * p.newScale;
  const y = cursorY - imgY * p.newScale;

  return { x, y };
};

const clampOffset = (p: {
  offset: TCoord;
  scale: number;
  imageSize: { width: number; height: number };
  containerSize: { width: number; height: number };
}) => {
  const scaledWidth = p.imageSize.width * p.scale;
  const scaledHeight = p.imageSize.height * p.scale;

  let minX: number, maxX: number;
  let minY: number, maxY: number;

  if (scaledWidth > p.containerSize.width) {
    minX = p.containerSize.width - scaledWidth;
    maxX = 0;
  } else {
    minX = maxX = (p.containerSize.width - scaledWidth) / 2;
  }

  if (scaledHeight > p.containerSize.height) {
    minY = p.containerSize.height - scaledHeight;
    maxY = 0;
  } else {
    minY = maxY = (p.containerSize.height - scaledHeight) / 2;
  }

  return {
    x: clamp({ value: p.offset.x, min: minX, max: maxX }),
    y: clamp({ value: p.offset.y, min: minY, max: maxY }),
  };
};

export const ZoomableImage = (p: {
  src: string;
  onScaleChange: (scale: number) => void;
  onOffsetChange: (coord: TCoord) => void;
  onNaturalDimensionsChange: (dimensions: { width: number; height: number }) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [naturalImageDimensions, setNaturalImageDimensions] = useState({ width: 0, height: 0 });
  const [offsetCoord, setOffsetCoord] = useState<TCoord>({ x: 0, y: 0 });

  // Notify parent props
  useEffect(() => p.onScaleChange(scale), [scale]);
  useEffect(() => p.onOffsetChange(offsetCoord), [offsetCoord]);
  useEffect(() => p.onNaturalDimensionsChange(naturalImageDimensions), [naturalImageDimensions]);

  // Center image if smaller than container
  useEffect(() => {
    const container = containerRef.current;
    if (!container || naturalImageDimensions.width === 0) return;

    const containerRect = container.getBoundingClientRect();
    const x = Math.max((containerRect.width - naturalImageDimensions.width) / 2, 0);
    const y = Math.max((containerRect.height - naturalImageDimensions.height) / 2, 0);
    setOffsetCoord({ x, y });
  }, [naturalImageDimensions]);

  const zoom = (pZoom: {
    direction: 1 | -1;
    rect: DOMRect;
    clientCoord: { x: number; y: number };
  }) => {
    const tempScale = scale + pZoom.direction * zoomIncrement;
    const newScale = Math.min(Math.max(tempScale, 0.2), 8);

    if (scale === newScale) return;

    const newOffsetCoord = computeOffset({
      rect: pZoom.rect,
      oldScale: scale,
      newScale,
      clientCoord: pZoom.clientCoord,
      offsetCoord,
    });

    // Clamp offset after zoom if image larger than container
    const clampedOffset =
      naturalImageDimensions.width * newScale > pZoom.rect.width ||
      naturalImageDimensions.height * newScale > pZoom.rect.height
        ? clampOffset({
            offset: newOffsetCoord,
            scale: newScale,
            imageSize: naturalImageDimensions,
            containerSize: { width: pZoom.rect.width, height: pZoom.rect.height },
          })
        : newOffsetCoord;

    setOffsetCoord(clampedOffset);
    setScale(newScale);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();

      if (e.ctrlKey || e.metaKey) {
        const direction = e.deltaY > 0 ? -1 : 1;
        zoom({ direction, rect, clientCoord: { x: e.clientX, y: e.clientY } });
      } else {
        const newOffset = { x: offsetCoord.x - e.deltaX, y: offsetCoord.y - e.deltaY };
        const clampedOffset =
          naturalImageDimensions.width * scale > rect.width ||
          naturalImageDimensions.height * scale > rect.height
            ? clampOffset({
                offset: newOffset,
                scale,
                imageSize: naturalImageDimensions,
                containerSize: { width: rect.width, height: rect.height },
              })
            : newOffset;
        setOffsetCoord(clampedOffset);
      }
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [scale, offsetCoord, naturalImageDimensions]);

  return (
    <div
      ref={containerRef}
      style={{
        touchAction: "none",
        background: "gray",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <img
        onLoad={(e) => {
          setNaturalImageDimensions({
            width: e.currentTarget.naturalWidth,
            height: e.currentTarget.naturalHeight,
          });
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
  );
};
