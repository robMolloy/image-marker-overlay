import { useEffect, useRef, useState, type ReactNode } from "react";

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

const PositionOverlayItem = (p: { xPercent: number; yPercent: number; children: ReactNode }) => (
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
  zoom: number;
  onClick: (p: { xPercent: number; yPercent: number }) => void;
  onWheelUp: () => void;
  onWheelDown: () => void;
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const isScrollUp = e.deltaY < 0;
      const fn = isScrollUp ? p.onWheelUp : p.onWheelDown;
      fn();
    };

    img.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      img.removeEventListener("wheel", handleWheel);
    };
  }, [p.onWheelUp, p.onWheelDown]);

  return (
    <img
      ref={imgRef}
      src={p.src}
      onLoad={(e) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        setNaturalDimensions({ width: naturalWidth, height: naturalHeight });
      }}
      onClick={(e) => {
        if (!imgRef.current) return;
        const rect = imgRef.current.getBoundingClientRect();

        // Use scaled DOM width/height directly
        const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
        const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

        p.onClick({ xPercent, yPercent });
      }}
      style={{
        display: "inline-block",
        verticalAlign: "top", // remove the 4px baseline gap
        width: `${naturalDimensions.width * p.zoom}px`,
        height: `${naturalDimensions.height * p.zoom}px`,
        cursor: "crosshair",
        overscrollBehavior: "none", // prevent scroll chaining
      }}
      alt=""
    />
  );
};

const OverlayMarkerWrapper = (p: {
  markers: { xPercent: number; yPercent: number }[];
  children: ReactNode;
  onMarkerClick: (x: { xPercent: number; yPercent: number }) => void;
}) => {
  return (
    <div style={{ position: "relative", display: "inline-block", fontSize: 0 }}>
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

const ImageWithMarkers = (p: { src: string }) => {
  const [markers, setMarkers] = useState<{ xPercent: number; yPercent: number }[]>([]);
  const [zoom, setZoom] = useState(1);

  return (
    <div>
      <OverlayMarkerWrapper
        markers={markers}
        onMarkerClick={(x) => {
          setMarkers((prev) =>
            prev.filter(
              (marker) => marker.xPercent !== x.xPercent || marker.yPercent !== x.yPercent
            )
          );
        }}
      >
        <InteractiveImage
          onWheelUp={() => setZoom((z) => z * 1.2)}
          onWheelDown={() => setZoom((z) => z / 1.2)}
          src={p.src}
          onClick={(coord) => setMarkers((markers) => [...markers, coord])}
          zoom={zoom}
        />
      </OverlayMarkerWrapper>
    </div>
  );
};
