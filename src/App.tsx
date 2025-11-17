import { useRef, useState, type ReactNode } from "react";

const Marker = (p: { size: number; color: string; onClick: () => void }) => (
  <div
    onClick={p.onClick}
    style={{
      width: p.size,
      height: p.size,
      backgroundColor: p.color,
      borderRadius: "50%",
      border: "1px solid black",
      cursor: "pointer",
    }}
  />
);

const PositionOverlayItem = (p: {
  xPercent: number;
  yPercent: number;
  children: ReactNode;
}) => (
  <div
    style={{
      position: "absolute",
      left: p.xPercent + "%",
      top: p.yPercent + "%",
      transform: "translate(-50%, -50%)",
      pointerEvents: "auto",
    }}
  >
    {p.children}
  </div>
);

const InteractiveImage = (p: {
  src: string;
  onClick: (p: { xPercent: number; yPercent: number }) => void;
  zoom: number;
}) => {
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <div style={{ overflow: "hidden", display: "inline-block" }}>
      <img
        src={p.src}
        ref={imgRef}
        onClick={(e) => {
          if (!imgRef.current) return;

          const rect = imgRef.current.getBoundingClientRect();
          const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
          const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

          p.onClick({ xPercent, yPercent });
        }}
        style={{
          display: "block",
          height: "auto",
          cursor: "crosshair",
          transform: `scale(${p.zoom})`,
          transformOrigin: "top left",
        }}
        alt="Interactive"
      />
    </div>
  );
};

const OverlayMarkerWrapper = (p: {
  markers: { xPercent: number; yPercent: number }[];
  children: ReactNode;
  onMarkerClick: (x: { xPercent: number; yPercent: number }) => void;
}) => {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {p.children}
      {p.markers.map((marker) => (
        <PositionOverlayItem
          key={`${marker.xPercent}-${marker.yPercent}`}
          xPercent={marker.xPercent}
          yPercent={marker.yPercent}
        >
          <Marker
            size={10}
            color={"white"}
            onClick={() => {
              p.onMarkerClick({
                xPercent: marker.xPercent,
                yPercent: marker.yPercent,
              });
            }}
          />
        </PositionOverlayItem>
      ))}
    </div>
  );
};

const App = () => {
  const [markers, setMarkers] = useState<
    { xPercent: number; yPercent: number }[]
  >([]);
  const [zoom, setZoom] = useState(1);

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setZoom((z) => z * 1.2)}>Zoom In</button>
        <button onClick={() => setZoom((z) => z / 1.2)}>Zoom Out</button>
      </div>

      <OverlayMarkerWrapper markers={markers} onMarkerClick={() => {}}>
        <InteractiveImage
          src="https://upload.wikimedia.org/wikipedia/commons/8/85/Smiley.svg"
          onClick={(coord) => setMarkers((markers) => [...markers, coord])}
          zoom={zoom}
        />
      </OverlayMarkerWrapper>
    </div>
  );
};

export default App;
