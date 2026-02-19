"use client";

import React, { useCallback, useEffect, useState } from "react";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MoveUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { bbox } from "@turf/bbox";

const Mapcomponent = () => {
  const [map, setmap] = useState<any>(null);
  const [layerControl, setlayerControl] = useState({ point: false });
  const [rotate, setrotate] = useState(0);
  const [mouseLocation, setmouseLocation] = useState<any>(undefined);
  const [draw, setdraw] = useState<any>(null);
  const [editFeature, seteditFeature] = useState<any>(null);
  const [selectMode, setselectMode] = useState(false);
  const [featureType, setfeatureType] = useState("");
  const [selectFeature, setselectFeature] = useState([]);
  const [deleteFeature, setdeleteFeature] = useState([]);
  useEffect(() => {
    const initMap = new maplibregl.Map({
      container: "map",
      style:
        "https://app.vallarismaps.com/core/api/styles/1.0-beta/styles/698d91b491e3337911ebe988?api_key=Y9TeAcfoHoT3RKGW44za0T1dF4bYHaOScEXy8cCLbUEDOtqXolbRSq7S3C2hkDAv",
      zoom: 13,

      center: [102.73948342180302, 16.286630370487046],
    });
    const Draw: any = new MapboxDraw({
      displayControlsDefault: false,
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
  // "step_test" | "flow_meter" | "dma_boundary"
  useEffect(() => {
    map?.on("draw.create", (e: any) => {
      const feature = e.features[0];
      draw?.setFeatureProperty(feature.id, "name", "PWA");
      draw?.setFeatureProperty(feature.id, "description", "PWA-WORKSHOP");
      draw?.setFeatureProperty(feature.id, "_remove_create", true);
      draw?.setFeatureProperty(feature.id, "_remove_type", featureType);
    });
  }, [map, draw, featureType]);
  // editFeature ? true : false

  useEffect(() => {
    const onClick = (e: any) => {
      const features: any = map?.queryRenderedFeatures(e.point);
      const filterfeatures = features.filter(
        (x: any) =>
          x.layer.id === "step_test" ||
          x.layer.id === "flow_meter" ||
          x.layer.id === "dma_boundary",
        // ["step_test", "flow_meter", "dma_boundary"].includes(x.layer.id),
      );

      if (filterfeatures?.length > 1) {
        setselectFeature(filterfeatures);
      } else if (filterfeatures?.[0]) {
        const f = filterfeatures[0];

        map?.setFilter(f.layer.id, [
          "any",
          ["all", ["!=", "_id", f.properties._id]],
        ]);
        let add = f;
        add.properties[`_remove_type`] = f.layer.id;

        draw?.add(add);
        draw?.changeMode("simple_select", { featureIds: f.id });
        setselectMode(false);
      }
    };
    if (selectMode) {
      map?.on("click", onClick);
    }

    return () => {
      map?.off("click", onClick);
    };
  }, [map, selectMode]);

  const onSave = () => {
    const allFeature = draw?.getAll();
    console.log(allFeature);
    const addFeature: any = {
      step_test: [],
      flow_meter: [],
      dma_boundary: [],
    };

    allFeature.features
      ?.filter((x: any) => x.properties._remove_create)
      ?.map((y: any) => {
        const type = y.properties._remove_type;

        delete y.id;
        delete y.properties._remove_create;

        delete y.properties._remove_type;
        if (type === "step_test") {
          addFeature.step_test.push(y);
        } else if (type === "flow_meter") {
          delete y.id;
          addFeature.flow_meter.push(y);
        } else if (type === "dma_boundary") {
          delete y.id;
          addFeature.dma_boundary.push(y);
        }
      });

    const Delete = {
      type: "FeatureCollection",
      features: deleteFeature,
    };

    // const addFeature = allFeature.features
    //   ?.filter((x: any) => x.properties._remove_create)
    //   ?.reduce(
    //     (previous: any, current: any) => {
    //       const type = current.properties._remove_type;
    //       return {
    //         ...previous,
    //         [type]: [...previous[type], current],
    //       };
    //     },
    //     {
    //       step_test: [],
    //       flow_meter: [],
    //       dma_boundary: [],
    //     },
    //   );

    // const { properties, id, ...other } = current;
    // const { _remove_create, _remove_type, ...a } = properties;
    // const body = { ...other, properties: { ...a } };
    // return {
    //   ...previous,
    //   [_remove_type]: [...previous[_remove_type], body],
    // };
  };

  const onCheck = async () => {
    const allFeature = draw?.getAll();

    // const boundingBox = bbox(allFeature);

    // const get = await fetch(
    //   `${process.env.NEXT_PUBLIC_PWA_HOST}/collections/flow_meter/items?bbox=${boundingBox.join(",")}`,
    // ).then(async (response) => {
    //   return { status: response.status, result: await response.json() };
    // });
    // console.log(get);

    const [minLon, minLat, maxLon, maxLat] = bbox(allFeature);
    const minCoord = map.project([minLon, minLat]); // or [minLon, minLat];
    const maxCoord = map.project([maxLon, maxLat]); // or [maxLon, maxLat];

    const bound = [minCoord, maxCoord];
    const features = map?.queryRenderedFeatures(bound, {
      layers: ["flow_meter"],
    });

    console.log(features);

    // layers: "flow_meter",
  };

  const onDelete = () => {
    const selectfeature = draw?.getSelected();

    const remove = selectfeature?.features.map((x: any) => {
      draw?.delete(x.id);

      return { id: x.properties._id };
    });
    setdeleteFeature(remove);
    //   const feature = draw?.getSelectedIds();

    // draw?.delete(feature);
  };
  return (
    <div className="h-screen w-screen relative">
      <Dialog
        open={Boolean(selectFeature.length)}
        onOpenChange={(s) => {
          if (!s) {
            setselectFeature([]);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เลือกข้อมูลที่ต้องการแก้ไข</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] ">
            <div className="flex flex-col space-y-2">
              {selectFeature.map((x: any, index: number) => {
                return (
                  <div
                    key={`layer-${index}`}
                    className="border rounded-2xl p-2 cursor-pointer"
                    onClick={() => {
                      map?.setFilter(x.layer.id, [
                        "any",
                        ["all", ["!=", "_id", x.properties._id]],
                      ]);
                      let add = x;
                      add.properties[`_remove_type`] = x.layer.id;

                      draw?.add(add);
                      draw?.changeMode("simple_select", { featureIds: x.id });
                      setselectFeature([]);
                      setselectMode(false);
                    }}
                  >
                    <p> {x.layer.id}</p>

                    {Object.keys(x?.properties)
                      .filter((s: any) => !s.startsWith("_"))
                      .map((l: any) => {
                        return (
                          <div key={l} className="flex flex-row space-x-2">
                            <p>{l}</p>
                            <p> : </p>
                            <p>{x?.properties[l] ? x?.properties[l] : ""}</p>
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

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
          <ScrollArea className="h-[60vh]">
            {Object.keys(editFeature ? editFeature?.properties : {})
              .filter((s: any) => !s.startsWith("_"))
              .map((l: any) => {
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
              })}
          </ScrollArea>

          <DialogFooter>
            <Button
              onClick={() => {
                let all = draw?.getAll();

                const index = all.features?.findIndex(
                  (x: any) => x.id === editFeature.id,
                );

                all.features[index] = editFeature;

                draw?.set(all);

                seteditFeature(null);
              }}
            >
              SAVE
            </Button>
          </DialogFooter>
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
            setselectMode(selectMode ? false : true);
          }}
        >
          {selectMode ? "Cancel Select" : "Select Feature"}
        </Button>
        <Button
          onClick={() => {
            draw?.changeMode("draw_point");
            setfeatureType("flow_meter");
          }}
        >
          Draw flow_meter
        </Button>

        {/* <Button
          onClick={() => {
            draw?.changeMode("draw_line_string");
          }}
        >
          Draw line
        </Button> */}

        <Button
          onClick={() => {
            draw?.changeMode("draw_polygon");
            setfeatureType("dma_boundary");
          }}
        >
          Draw dma_boundary
        </Button>

        <Button
          onClick={() => {
            draw?.changeMode("draw_polygon");
            setfeatureType("step_test");
          }}
        >
          Draw step_test
        </Button>
        <Button
          onClick={() => {
            onDelete();
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
            onCheck();
          }}
        >
          Check
        </Button>
        <Button
          onClick={() => {
            onSave();
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
