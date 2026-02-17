"use client";

import React, { useEffect, useState } from "react";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MoveUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
const Mapcomponent = () => {
  const [map, setmap] = useState<any>(null);
  const [layerControl, setlayerControl] = useState({ point: false });
  const [rotate, setrotate] = useState(0);
  const [mouseLocation, setmouseLocation] = useState<any>(undefined);
  const [draw, setdraw] = useState<any>(null);
  const [editFeature, seteditFeature] = useState<any>(null);

  useEffect(() => {
    const initMap = new maplibregl.Map({
      container: "map",
      style: "https://tiles.openfreemap.org/styles/bright",
      zoom: 17,

      center: [102.819242, 16.455854],
    });
    const Draw: any = new MapboxDraw({
      styles: [
        {
          id: "gl-draw-polygon-fill",
          type: "fill",
          filter: ["all", ["==", "$type", "Polygon"]],
          paint: {
            "fill-color": [
              "case",
              ["==", ["get", "active"], "true"],
              "orange",
              "blue",
            ],
            "fill-opacity": 0.1,
          },
        },
        {
          id: "gl-draw-lines",
          type: "line",
          filter: [
            "any",
            ["==", "$type", "LineString"],
            ["==", "$type", "Polygon"],
          ],
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": [
              "case",
              ["==", ["get", "active"], "true"],
              "orange",
              "blue",
            ],
            "line-dasharray": [
              "case",
              ["==", ["get", "active"], "true"],
              ["literal", [0.2, 2]],
              ["literal", [0.2, 2]],
            ],
            "line-width": 2,
          },
        },
        {
          id: "gl-draw-point-outer",
          type: "circle",
          filter: ["all", ["==", "$type", "Point"], ["==", "meta", "feature"]],
          paint: {
            "circle-radius": ["case", ["==", ["get", "active"], "true"], 7, 5],
            "circle-color": "white",
          },
        },
        {
          id: "gl-draw-point-inner",
          type: "circle",
          filter: ["all", ["==", "$type", "Point"], ["==", "meta", "feature"]],
          paint: {
            "circle-radius": ["case", ["==", ["get", "active"], "true"], 5, 3],
            "circle-color": [
              "case",
              ["==", ["get", "active"], "true"],
              "orange",
              "blue",
            ],
          },
        },
        {
          id: "gl-draw-vertex-outer",
          type: "circle",
          filter: [
            "all",
            ["==", "$type", "Point"],
            ["==", "meta", "vertex"],
            ["!=", "mode", "simple_select"],
          ],
          paint: {
            "circle-radius": ["case", ["==", ["get", "active"], "true"], 7, 5],
            "circle-color": "white",
          },
        },
        {
          id: "gl-draw-vertex-inner",
          type: "circle",
          filter: [
            "all",
            ["==", "$type", "Point"],
            ["==", "meta", "vertex"],
            ["!=", "mode", "simple_select"],
          ],
          paint: {
            "circle-radius": ["case", ["==", ["get", "active"], "true"], 5, 3],
            "circle-color": "orange",
          },
        },
        {
          id: "gl-draw-midpoint",
          type: "circle",
          filter: ["all", ["==", "meta", "midpoint"]],
          paint: { "circle-radius": 3, "circle-color": "orange" },
        },
      ],
    });

    initMap.addControl(Draw);
    setdraw(Draw);
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

  useEffect(() => {
    map?.on("draw.create", (e: any) => {
      const feature = e.features[0];
      draw?.setFeatureProperty(feature.id, "name", "PWA");
      draw?.setFeatureProperty(feature.id, "description", "PWA-WORKSHOP");
    });
  }, [map, draw]);
  // editFeature ? true : false

  return (
    <div className="h-screen w-screen relative">
      <Dialog
        open={Boolean(editFeature)}
        onOpenChange={(s) => {
          if (!s) {
            seteditFeature(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>

          {Object.keys(editFeature ? editFeature?.properties : {}).map(
            (l: any) => {
              return (
                <div key={l}>
                  <p>{l}</p>
                  <Input
                    value={
                      editFeature?.properties[l]
                        ? editFeature?.properties[l]
                        : ""
                    }
                    onChange={(e) => {
                      const newData = {
                        ...editFeature,
                        properties: {
                          ...editFeature.properties,
                          [l]: e.target.value,
                        },
                      };

                      seteditFeature(newData);
                    }}
                  />
                </div>
              );
            },
          )}
        </DialogContent>
      </Dialog>

      {mouseLocation ? (
        <div className="bg-white rounded-lg absolute top-2 right-2 flex flex-col space-y-2 z-10 p-2">
          <p> {`lat : ${mouseLocation.lat}`}</p>
          <p> {`lng : ${mouseLocation.lng}`}</p>
        </div>
      ) : null}

      <div className="absolute z-10 right-2 top-1/2 flex flex-col space-y-2">
        <Button
          onClick={() => {
            draw?.changeMode("draw_point");
          }}
        >
          Draw point
        </Button>

        <Button
          onClick={() => {
            draw?.changeMode("draw_line_string");
          }}
        >
          Draw line
        </Button>

        <Button
          onClick={() => {
            draw?.changeMode("draw_polygon");
          }}
        >
          Draw polygon
        </Button>
        <Button
          onClick={() => {
            const feature = draw?.getSelectedIds();

            draw?.delete(feature);
          }}
        >
          Delete
        </Button>

        <Button
          onClick={() => {
            draw?.deleteAll();
          }}
        >
          Delete All
        </Button>

        <Button
          onClick={() => {
            const feature = draw?.getSelected();

            if (feature.features[0]) {
              seteditFeature(feature.features[0]);
            }
          }}
        >
          Attribute
        </Button>

        <Button
          onClick={() => {
            console.log(draw?.getAll());
          }}
        >
          Save
        </Button>
        {/* <Button
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
        </Button> */}
      </div>
      <div className="h-full w-full" id="map"></div>
    </div>
  );
};

export default Mapcomponent;
