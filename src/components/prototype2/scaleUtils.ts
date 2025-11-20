export const zoomIncrement = 0.08;

export const computeScale = (p: { direction: 1 | -1; scale: number }) => {
  const tempScale = p.scale + p.direction * zoomIncrement;
  return tempScale < 0.2 ? 0.2 : tempScale > 8 ? 8 : tempScale;
};

export const getScaledImageDimensions = (p: {
  naturalImageDimensions: { width: number; height: number };
  scale: number;
}) => {
  return {
    width: p.naturalImageDimensions.width * p.scale,
    height: p.naturalImageDimensions.height * p.scale,
  };
};

export const isImageSmallerThanContainer = (p: {
  scaledImageDimensions: { width: number; height: number };
  containerRect: DOMRect;
}) => {
  return (
    p.scaledImageDimensions.width < p.containerRect.width &&
    p.scaledImageDimensions.height < p.containerRect.height
  );
};
