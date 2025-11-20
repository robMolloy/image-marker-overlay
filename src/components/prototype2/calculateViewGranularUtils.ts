// isLeftEdgeOutOfLeftBound;
// isRightEdgeOutOfRightBound;
// isTopEdgeOutOfTopBound;
// isBottomEdgeOutOfBottomBound;

export const isLeftEdgeOutOfLeftBound = (p: { offsetCoord: { x: number; y: number } }) => {
  const leftEdge = p.offsetCoord.x;
  return leftEdge <= 0;
};

export const isRightEdgeOutOfRightBound = (p: {
  offsetCoord: { x: number; y: number };
  scaledImageDimensions: { width: number; height: number };
  containerRect: DOMRect;
}) => {
  const rightEdge = p.offsetCoord.x + p.scaledImageDimensions.width;
  return rightEdge >= p.containerRect.width;
};

export const isTopEdgeOutOfTopBound = (p: { offsetCoord: { x: number; y: number } }) => {
  const topEdge = p.offsetCoord.y;
  return topEdge <= 0;
};

export const isBottomEdgeOutOfBottomBound = (p: {
  offsetCoord: { x: number; y: number };
  scaledImageDimensions: { width: number; height: number };
  containerRect: DOMRect;
}) => {
  const bottomEdge = p.offsetCoord.y + p.scaledImageDimensions.height;
  return bottomEdge >= p.containerRect.height;
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

export const getCoordXForRightEdgeOnRightOfContainer = (p: {
  scaledImageDimensions: { width: number; height: number };
  containerRect: DOMRect;
}) => {
  return p.containerRect.width - p.scaledImageDimensions.width;
};
export const getCoordYForBottomEdgeOnBottomOfContainer = (p: {
  scaledImageDimensions: { width: number; height: number };
  containerRect: DOMRect;
}) => {
  return p.containerRect.height - p.scaledImageDimensions.height;
};
export const getCoordXForLeftEdgeOnLeftOfContainer = () => 0;
export const getCoordYForTopEdgeOnTopOfContainer = () => 0;

export const isLeftEdgeToRightOfLeftContainerEdge = (p: {
  offsetCoord: { x: number; y: number };
}) => {
  const leftEdge = p.offsetCoord.x;

  return leftEdge >= 0;
};

export const isRightEdgeToLeftOfRightContainerEdge = (p: {
  offsetCoord: { x: number; y: number };
  scaledImageDimensions: { width: number; height: number };
  containerRect: DOMRect;
}) => {
  const rightEdge = p.offsetCoord.x + p.scaledImageDimensions.width;
  const containerWidth = p.containerRect.width;

  return rightEdge <= containerWidth;
};

export const isTopEdgeBelowOfTopContainerEdge = (p: { offsetCoord: { x: number; y: number } }) => {
  const topEdge = p.offsetCoord.y;

  return topEdge >= 0;
};

export const isBottomEdgeAboveOfBottomContainerEdge = (p: {
  offsetCoord: { x: number; y: number };
  scaledImageDimensions: { width: number; height: number };
  containerRect: DOMRect;
}) => {
  const bottomEdge = p.offsetCoord.y + p.scaledImageDimensions.height;
  const containerHeight = p.containerRect.height;

  return bottomEdge <= containerHeight;
};
