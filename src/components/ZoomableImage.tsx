import { useEffect, useRef, useState } from "react";

const computeOffset = (p: {
  containerRect: DOMRect;
  oldScale: number;
  newScale: number;
  clientCoord: { x: number; y: number };
  offsetCoord: { x: number; y: number };
}) => {
  const cursorX = p.clientCoord.x - p.containerRect.left;
  const cursorY = p.clientCoord.y - p.containerRect.top;

  const imgX = (cursorX - p.offsetCoord.x) / p.oldScale;
  const imgY = (cursorY - p.offsetCoord.y) / p.oldScale;

  const x = cursorX - imgX * p.newScale;
  const y = cursorY - imgY * p.newScale;

  return { x, y };
};

const computeScale = (p: { direction: 1 | -1; scale: number }) => {
  const tempScale = p.scale + p.direction * zoomIncrement;
  return tempScale < 0.2 ? 0.2 : tempScale > 8 ? 8 : tempScale;
};

const isCompletelyOutOfBounds = (p: {
  offset: { x: number; y: number };
  naturalImageDimensions: { width: number; height: number };
  scale: number;
  containerRect: DOMRect;
}) => {
  const imageWidth = p.naturalImageDimensions.width * p.scale;
  const imageHeight = p.naturalImageDimensions.height * p.scale;

  const leftEdge = p.offset.x;
  const rightEdge = p.offset.x + imageWidth;
  const topEdge = p.offset.y;
  const bottomEdge = p.offset.y + imageHeight;

  return (
    rightEdge < 0 ||
    leftEdge > p.containerRect.width ||
    bottomEdge < 0 ||
    topEdge > p.containerRect.height
  );
};

const isRightCompletelyOutOfBounds = (p: {
  offsetCoord: { x: number; y: number };
  scaledImageDimensions: { width: number; height: number };
}) => {
  const rightEdge = p.offsetCoord.x + p.scaledImageDimensions.width;
  return rightEdge < 0;
};

const isLeftCompletelyOutOfBounds = (p: {
  offsetCoord: { x: number; y: number };
  containerRect: DOMRect;
}) => {
  const leftEdge = p.offsetCoord.x;
  return leftEdge > p.containerRect.width;
};

const isTopCompletelyOutOfBounds = (p: {
  offsetCoord: { x: number; y: number };
  containerRect: DOMRect;
}) => {
  const topEdge = p.offsetCoord.y;
  return topEdge > p.containerRect.height;
};

const isBottomCompletelyOutOfBounds = (p: {
  offsetCoord: { x: number; y: number };
  scaledImageDimensions: { width: number; height: number };
}) => {
  const bottomEdge = p.offsetCoord.y + p.scaledImageDimensions.height;
  return bottomEdge < 0;
};

const isSomeOutOfBounds = (p: {
  offset: { x: number; y: number };
  naturalImageDimensions: { width: number; height: number };
  scale: number;
  containerRect: DOMRect;
}) => {
  const imageWidth = p.naturalImageDimensions.width * p.scale;
  const imageHeight = p.naturalImageDimensions.height * p.scale;

  const leftEdge = p.offset.x;
  const rightEdge = p.offset.x + imageWidth;
  const topEdge = p.offset.y;
  const bottomEdge = p.offset.y + imageHeight;

  return (
    leftEdge < 0 ||
    rightEdge > p.containerRect.width ||
    topEdge < 0 ||
    bottomEdge > p.containerRect.height
  );
};

const isLeftSomeOutOfBounds = (p: { offsetCoord: { x: number; y: number } }) => {
  const leftEdge = p.offsetCoord.x;
  return leftEdge < 0;
};

const isRightSomeOutOfBounds = (p: {
  offsetCoord: { x: number; y: number };
  scaledImageDimensions: { width: number; height: number };
  containerRect: DOMRect;
}) => {
  const rightEdge = p.offsetCoord.x + p.scaledImageDimensions.width;
  return rightEdge > p.containerRect.width;
};

const isTopSomeOutOfBounds = (p: { offsetCoord: { x: number; y: number } }) => {
  const topEdge = p.offsetCoord.y;
  return topEdge < 0;
};

const isBottomSomeOutOfBounds = (p: {
  offsetCoord: { x: number; y: number };
  scaledImageDimensions: { width: number; height: number };
  containerRect: DOMRect;
}) => {
  const bottomEdge = p.offsetCoord.y + p.scaledImageDimensions.height;
  return bottomEdge > p.containerRect.height;
};

const getScaledImageDimensions = (p: {
  naturalImageDimensions: { width: number; height: number };
  scale: number;
}) => {
  return {
    width: p.naturalImageDimensions.width * p.scale,
    height: p.naturalImageDimensions.height * p.scale,
  };
};

const isImageSmallerThanContainer = (p: {
  scaledImageDimensions: { width: number; height: number };
  containerRect: DOMRect;
}) => {
  return (
    p.scaledImageDimensions.width < p.containerRect.width &&
    p.scaledImageDimensions.height < p.containerRect.height
  );
};

const getAlignRightOffsetX = (p: {
  scaledImageDimensions: { width: number; height: number };
  containerRect: DOMRect;
}) => {
  return p.containerRect.width - p.scaledImageDimensions.width;
};
const getAlignBottomOffsetY = (p: {
  scaledImageDimensions: { width: number; height: number };
  containerRect: DOMRect;
}) => {
  return p.containerRect.height - p.scaledImageDimensions.height;
};
const getAlignLeftOffsetX = () => 0;
const getAlignTopOffsetY = () => 0;

const getAlignedOffsetCoordsIfSomeOutOfBounds = (p: {
  offsetCoord: { x: number; y: number };
  scaledImageDimensions: { width: number; height: number };
  containerRect: DOMRect;
}) => {
  const { offsetCoord, scaledImageDimensions, containerRect } = p;
  if (isLeftSomeOutOfBounds({ offsetCoord })) return { x: getAlignLeftOffsetX(), y: offsetCoord.y };

  if (isRightSomeOutOfBounds({ offsetCoord, scaledImageDimensions, containerRect }))
    return { x: getAlignRightOffsetX({ scaledImageDimensions, containerRect }), y: offsetCoord.y };

  if (isTopSomeOutOfBounds({ offsetCoord })) return { x: offsetCoord.x, y: getAlignTopOffsetY() };

  if (isBottomSomeOutOfBounds({ offsetCoord, scaledImageDimensions, containerRect }))
    return { x: offsetCoord.x, y: getAlignBottomOffsetY({ scaledImageDimensions, containerRect }) };
};

const getAlignedOffsetCoordsIfCompletelyOutOfBounds = (p: {
  offsetCoord: { x: number; y: number };
  scaledImageDimensions: { width: number; height: number };
  containerRect: DOMRect;
}) => {
  const { offsetCoord, scaledImageDimensions, containerRect } = p;
  if (isLeftCompletelyOutOfBounds({ offsetCoord, containerRect }))
    return { x: getAlignRightOffsetX({ scaledImageDimensions, containerRect }), y: offsetCoord.y };

  if (isRightCompletelyOutOfBounds({ scaledImageDimensions, offsetCoord }))
    return { x: getAlignLeftOffsetX(), y: offsetCoord.y };

  if (isTopCompletelyOutOfBounds({ offsetCoord, containerRect }))
    return { x: offsetCoord.x, y: getAlignBottomOffsetY({ scaledImageDimensions, containerRect }) };

  if (isBottomCompletelyOutOfBounds({ offsetCoord, scaledImageDimensions }))
    return { x: offsetCoord.x, y: getAlignTopOffsetY() };
};

const clampOffsetToContainerBounds = (p: {
  offsetCoord: { x: number; y: number };
  scaledImageDimensions: { width: number; height: number };
  containerRect: DOMRect;
}) => {
  const { offsetCoord, containerRect, scaledImageDimensions } = p;
  if (isLeftCompletelyOutOfBounds({ offsetCoord, containerRect }))
    return { x: getAlignLeftOffsetX(), y: offsetCoord.y };
  if (isRightCompletelyOutOfBounds({ offsetCoord, scaledImageDimensions }))
    return { x: getAlignRightOffsetX({ scaledImageDimensions, containerRect }), y: offsetCoord.y };
  if (isBottomCompletelyOutOfBounds({ offsetCoord, scaledImageDimensions }))
    return { x: offsetCoord.x, y: getAlignBottomOffsetY({ scaledImageDimensions, containerRect }) };
  if (isTopCompletelyOutOfBounds({ offsetCoord, containerRect }))
    return { x: offsetCoord.x, y: getAlignTopOffsetY() };
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

  // const moveWithinBounds = () => {
  //   window.scrollTo(0, 0);
  //   setOffsetCoord({ x: 0, y: 0 });
  // };

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
        const realignedCoord = getAlignedOffsetCoordsIfSomeOutOfBounds({
          offsetCoord,
          scaledImageDimensions,
          containerRect,
        });
        return setOffsetCoord(realignedCoord ? realignedCoord : newOffsetCoord);
      } else {
        if (isSmaller) {
          const realignedCoord = getAlignedOffsetCoordsIfCompletelyOutOfBounds({
            offsetCoord,
            scaledImageDimensions,
            containerRect,
          });
          if (realignedCoord) return setOffsetCoord(realignedCoord);
        } else {
          const realignedCoord = clampOffsetToContainerBounds({
            offsetCoord,
            scaledImageDimensions,
            containerRect,
          });
          // const realignedCoord = getAlignedOffsetCoordsIfCompletelyOutOfBounds({
          //   offsetCoord,
          //   scaledImageDimensions,
          //   containerRect,
          // });
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
        // onDoubleClick={() => {
        //   const container = containerRef.current;
        //   if (!container) return;

        //   const containerRect = container.getBoundingClientRect();
        //   const isSmaller = isImageSmallerThanContainer({
        //     naturalImageDimensions,
        //     scale,
        //     containerRect,
        //   });

        //   console.log(`ZoomableImage.tsx:${/*LL*/ 161}`, { isSmaller });

        //   // const coordX = getRightOffsetX({
        //   //   naturalImageDimensions,
        //   //   scale,
        //   //   containerRect,
        //   // });

        //   // setOffsetCoord((prev) => ({ x: coordX, y: prev.y }));

        //   const coordY = getBottomOffsetY({
        //     naturalImageDimensions,
        //     scale,
        //     containerRect,
        //   });

        //   setOffsetCoord((prev) => ({ x: prev.x, y: coordY }));

        //   // const isoob = isCompletelyOutOfBounds({
        //   //   offset: offsetCoord,
        //   //   naturalImageDimensions,
        //   //   scale,
        //   //   containerRect: container.getBoundingClientRect(),
        //   // });
        //   // if (isoob) moveWithinBounds();
        // }}
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
