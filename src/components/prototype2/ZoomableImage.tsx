import { useEffect, useRef, useState } from "react";
import { computeScale } from "./scaleUtils";
import { computeOffset } from "./offsetUtils";
import {
  clampOffsetToContainerBounds,
  clampWhenImageIsSmallerThanContainer,
  getCoordToSnapToEdgeOfContainerWhenAnyEdgeGoesOutOfBounds,
} from "./calculateViewUtils";
import {
  getScaledImageDimensions,
  isImageSmallerThanContainer,
} from "./calculateViewGranularUtils";

type TCoord = { x: number; y: number };
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

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const containerRect = c.getBoundingClientRect();

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const scaledImageDimensions = getScaledImageDimensions({ naturalImageDimensions, scale });
      const isSmaller = isImageSmallerThanContainer({ scaledImageDimensions, containerRect });

      if (e.ctrlKey || e.metaKey) {
        const direction = e.deltaY > 0 ? -1 : 1;
        const newScale = computeScale({ direction, scale });

        if (scale === newScale) return;

        const newOffsetCoord = computeOffset({
          containerRect,
          oldScale: scale,
          newScale,
          clientCoord: { x: e.clientX, y: e.clientY },
          offsetCoord,
        });
        setScale(newScale);

        if (!isSmaller) return setOffsetCoord(newOffsetCoord);
        const realignedCoord = getCoordToSnapToEdgeOfContainerWhenAnyEdgeGoesOutOfBounds({
          offsetCoord,
          scaledImageDimensions,
          containerRect,
        });
        return setOffsetCoord(realignedCoord ? realignedCoord : newOffsetCoord);
      } else {
        if (isSmaller) {
          const realignedCoord = clampWhenImageIsSmallerThanContainer({
            offsetCoord,
            scaledImageDimensions,
            containerRect,
            directionX: e.deltaX > 0 ? 1 : -1,
            directionY: e.deltaY > 0 ? 1 : -1,
          });
          if (realignedCoord) return setOffsetCoord(realignedCoord);
        } else {
          const realignedCoord = clampOffsetToContainerBounds({
            offsetCoord,
            scaledImageDimensions,
            containerRect,
            directionX: e.deltaX > 0 ? 1 : -1,
            directionY: e.deltaY > 0 ? 1 : -1,
          });
          if (realignedCoord) return setOffsetCoord(realignedCoord);
        }
        setOffsetCoord((prev) => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
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
          style={{
            left: 0,
            top: 0,
            transform: `translate(${offsetCoord.x}px, ${offsetCoord.y}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
        />
      </div>
    </>
  );
};
