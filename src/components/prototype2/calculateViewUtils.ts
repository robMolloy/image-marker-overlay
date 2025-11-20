import {
  isLeftEdgeOutOfLeftBound,
  getCoordXForLeftEdgeOnLeftOfContainer,
  isRightEdgeOutOfRightBound,
  getCoordXForRightEdgeOnRightOfContainer,
  isTopEdgeOutOfTopBound,
  getCoordYForTopEdgeOnTopOfContainer,
  isBottomEdgeOutOfBottomBound,
  getCoordYForBottomEdgeOnBottomOfContainer,
  isLeftEdgeToRightOfLeftContainerEdge,
  isRightEdgeToLeftOfRightContainerEdge,
  isTopEdgeBelowOfTopContainerEdge,
  isBottomEdgeAboveOfBottomContainerEdge,
} from "./calculateViewGranularUtils";

export const getCoordToSnapToEdgeOfContainerWhenAnyEdgeGoesOutOfBounds = (p: {
  offsetCoord: { x: number; y: number };
  scaledImageDimensions: { width: number; height: number };
  containerRect: DOMRect;
}) => {
  const { offsetCoord, scaledImageDimensions, containerRect } = p;
  if (isLeftEdgeOutOfLeftBound({ offsetCoord }))
    return { x: getCoordXForLeftEdgeOnLeftOfContainer(), y: offsetCoord.y };

  if (isRightEdgeOutOfRightBound({ offsetCoord, scaledImageDimensions, containerRect }))
    return {
      x: getCoordXForRightEdgeOnRightOfContainer({ scaledImageDimensions, containerRect }),
      y: offsetCoord.y,
    };

  if (isTopEdgeOutOfTopBound({ offsetCoord }))
    return { x: offsetCoord.x, y: getCoordYForTopEdgeOnTopOfContainer() };

  if (isBottomEdgeOutOfBottomBound({ offsetCoord, scaledImageDimensions, containerRect }))
    return {
      x: offsetCoord.x,
      y: getCoordYForBottomEdgeOnBottomOfContainer({ scaledImageDimensions, containerRect }),
    };
};

export const clampOffsetToContainerBounds = (p: {
  offsetCoord: { x: number; y: number };
  scaledImageDimensions: { width: number; height: number };
  containerRect: DOMRect;
  directionX: 1 | -1;
  directionY: 1 | -1;
}) => {
  const { offsetCoord, directionX, directionY, scaledImageDimensions, containerRect } = p;
  if (isLeftEdgeToRightOfLeftContainerEdge({ offsetCoord }) && directionX === -1)
    return { x: getCoordXForLeftEdgeOnLeftOfContainer(), y: offsetCoord.y };

  if (
    isRightEdgeToLeftOfRightContainerEdge({ offsetCoord, scaledImageDimensions, containerRect }) &&
    directionX === 1
  )
    return {
      x: getCoordXForRightEdgeOnRightOfContainer({ scaledImageDimensions, containerRect }),
      y: offsetCoord.y,
    };

  if (isTopEdgeBelowOfTopContainerEdge({ offsetCoord }) && directionY === -1)
    return { x: offsetCoord.x, y: getCoordYForTopEdgeOnTopOfContainer() };

  if (
    isBottomEdgeAboveOfBottomContainerEdge({ offsetCoord, scaledImageDimensions, containerRect }) &&
    directionY === 1
  )
    return {
      x: offsetCoord.x,
      y: getCoordYForBottomEdgeOnBottomOfContainer({ scaledImageDimensions, containerRect }),
    };
};

export const clampWhenImageIsSmallerThanContainer = (p: {
  offsetCoord: { x: number; y: number };
  scaledImageDimensions: { width: number; height: number };
  containerRect: DOMRect;
  directionX: 1 | -1;
  directionY: 1 | -1;
}) => {
  const { offsetCoord, scaledImageDimensions, containerRect } = p;

  if (
    isRightEdgeToLeftOfRightContainerEdge({ offsetCoord, scaledImageDimensions, containerRect }) &&
    isLeftEdgeOutOfLeftBound({ offsetCoord }) &&
    p.directionX === 1
  )
    return { x: getCoordXForLeftEdgeOnLeftOfContainer(), y: offsetCoord.y };

  if (
    isBottomEdgeAboveOfBottomContainerEdge({ offsetCoord, scaledImageDimensions, containerRect }) &&
    isTopEdgeOutOfTopBound({ offsetCoord }) &&
    p.directionY === 1
  )
    return { x: offsetCoord.x, y: getCoordYForTopEdgeOnTopOfContainer() };

  if (
    isLeftEdgeToRightOfLeftContainerEdge({ offsetCoord }) &&
    isRightEdgeOutOfRightBound({ offsetCoord, scaledImageDimensions, containerRect }) &&
    p.directionX === -1
  )
    return {
      x: getCoordXForRightEdgeOnRightOfContainer({ scaledImageDimensions, containerRect }),
      y: offsetCoord.y,
    };

  if (
    isTopEdgeBelowOfTopContainerEdge({ offsetCoord }) &&
    isBottomEdgeOutOfBottomBound({
      offsetCoord,
      scaledImageDimensions,
      containerRect,
    }) &&
    p.directionY === -1
  )
    return {
      x: offsetCoord.x,
      y: getCoordYForBottomEdgeOnBottomOfContainer({ scaledImageDimensions, containerRect }),
    };
};
