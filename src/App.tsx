import { useEffect, useState } from "react";
import { ZoomableImage } from "./components/prototype2/ZoomableImage";

type TCoord = { x: number; y: number };
type TDimensions = { width: number; height: number };

const OverlayMarkerWrapper = (p: {
  markers: TCoord[];
  setMarkers: (cb: (prev: TCoord[]) => TCoord[]) => void;
  offset: TCoord;
  scale: number;
  children: React.ReactNode;
  naturalImageDimensions: TDimensions;
}) => {
  return (
    <div
      style={{ position: "relative" }}
      onDoubleClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const imageX = (clickX - p.offset.x) / p.scale;
        const imageY = (clickY - p.offset.y) / p.scale;

        if (
          imageX < 0 ||
          imageY < 0 ||
          imageX > p.naturalImageDimensions.width ||
          imageY > p.naturalImageDimensions.height
        )
          return;

        p.setMarkers((prev) => [...prev, { x: imageX, y: imageY }]);
      }}
    >
      {p.children}

      {p.markers.map((m) => {
        const screenX = p.offset.x + m.x * p.scale;
        const screenY = p.offset.y + m.y * p.scale;

        return (
          <div
            key={`${m.x}-${m.y}`}
            style={{
              position: "absolute",
              left: screenX,
              top: screenY,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "red",
              transform: "translate(-50%, -50%)",
              pointerEvents: "auto",
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              p.setMarkers((prev) => prev.filter((marker) => marker.x !== m.x || marker.y !== m.y));
            }}
          />
        );
      })}
    </div>
  );
};

const ImageWithMarkers = ({ src }: { src: string }) => {
  const [markers, setMarkers] = useState<TCoord[]>([]);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [naturalImageDimensions, setNaturalImageDimensions] = useState({ height: 0, width: 0 });

  return (
    <>
      <OverlayMarkerWrapper
        markers={markers}
        offset={offset}
        scale={scale}
        setMarkers={setMarkers}
        naturalImageDimensions={naturalImageDimensions}
      >
        <ZoomableImage
          src={src}
          onScaleChange={setScale}
          onOffsetChange={setOffset}
          onNaturalDimensionsChange={setNaturalImageDimensions}
        />
      </OverlayMarkerWrapper>
    </>
  );
};
const imgSrcs = [
  "http://localhost:5174/three-valleys.jpg",
  "http://localhost:5174/meribel.jpg",
  "http://localhost:5174/plan-3-vallees.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/8/85/Smiley.svg",
  "https://upload.wikimedia.org/wikipedia/commons/3/3e/IdeaLab_badge_2.png",
] as const;
const App = () => {
  useEffect(() => {
    window.document.body.style.overflow = "hidden";
    window.document.body.style.margin = "0";
    window.document.body.style.height = "100%";
  }, []);
  return (
    <>
      <ImageWithMarkers src={imgSrcs[1]} />
    </>
  );
};

export default App;
