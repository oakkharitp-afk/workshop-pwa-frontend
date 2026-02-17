"use client";

import React, { useEffect, useState } from "react";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MoveUp } from "lucide-react";
const Mapcomponent = () => {
  const [map, setmap] = useState<any>(null);
  const [layerControl, setlayerControl] = useState({ point: false });
  const [rotate, setrotate] = useState(0);
  const [mouseLocation, setmouseLocation] = useState<any>(undefined);
  useEffect(() => {
    const initMap = new maplibregl.Map({
      container: "map",
      style: "https://tiles.openfreemap.org/styles/bright",
      zoom: 17,

      center: [102.819242, 16.455854],
    });

    setmap(initMap);

    initMap.on("load", (e) => {
      e.target.addSource("contours", {
        type: "vector",
        url: "https://api.maptiler.com/tiles/contours/tiles.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL",
      });
      e.target.addLayer({
        id: "contour-lines",
        type: "line",
        source: "contours",
        "source-layer": "contour",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#ff69b4",
          "line-width": 1,
        },
      });
    });

    initMap.on("rotate", (e) => {
      setrotate(e.target.getBearing());
    });

    initMap.on("mousemove", (e) => {
      if (e.lngLat) {
        setmouseLocation(e?.lngLat);
      }
    });
  }, []);

  return (
    <div className="h-screen w-screen relative">
      {mouseLocation ? (
        <div className="bg-white rounded-lg absolute top-2 right-2 flex flex-col space-y-2 z-10 p-2">
          <p> {`lat : ${mouseLocation.lat}`}</p>
          <p> {`lng : ${mouseLocation.lng}`}</p>
        </div>
      ) : null}

      <div className="absolute z-10 right-2 top-1/2 flex flex-col space-y-2">
        <Button
          onClick={() => {
            map?.zoomIn();
          }}
        >
          +
        </Button>
        <Button
          onClick={() => {
            map?.zoomOut();
          }}
        >
          -
        </Button>

        <Button
          onClick={() => {
            map?.resetNorthPitch();
          }}
        >
          <MoveUp
            style={{
              transform: `rotate(${rotate}deg)`,
            }}
          />
        </Button>
      </div>
      <div className="h-full w-full" id="map"></div>
    </div>
  );
};

export default Mapcomponent;
