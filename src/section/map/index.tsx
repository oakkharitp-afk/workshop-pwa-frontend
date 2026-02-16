"use client";

import React, { useEffect, useState } from "react";

import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Button } from "@/components/ui/button";
const Mapcomponent = () => {
  const [map, setmap] = useState<Map | null>(null);

  useEffect(() => {
    const initMap = new maplibregl.Map({
      container: "map",
      style: "https://tiles.openfreemap.org/styles/bright",
      zoom: 17,

      center: [102.819242, 16.455854],
    });

    setmap(initMap);
  }, []);

  return (
    <div className="h-screen w-screen relative">
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
      </div>
      <div className="h-full w-full" id="map"></div>
    </div>
  );
};

export default Mapcomponent;
