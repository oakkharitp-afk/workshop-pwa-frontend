"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Layers,
  Minus,
  MoveUp,
  Pencil,
  Plus,
  Save,
  Settings,
  Sheet,
  Trash2,
} from "lucide-react";
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

import * as turf from "@turf/turf";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
const Mapcomponent = () => {
  const [map, setmap] = useState<any>(null);

  const [draw, setdraw] = useState<any>(null);
  const [rotate, setrotate] = useState(0);
  const [mouseLocation, setmouseLocation] = useState<any>(undefined);

  const [editFeature, seteditFeature] = useState<any>(null);

  const [modeStatus, setmodeStatus] = useState({
    selectMode: false,
    drawMode: false,
    selected: false,
    canSave: false,
  });
  const [featureType, setfeatureType] = useState("");
  const [selectFeature, setselectFeature] = useState([]);
  const [deleteFeature, setdeleteFeature] = useState([]);
  const [loading, setloading] = useState(false);

  const [layerList, setlayerList] = useState<any[]>([]);
  const [collape, setcollape] = useState(undefined);

  // init map
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
      //เพิ่ม label ของ flow_meter
      e.target.addLayer({
        id: "flow_meter-label",
        type: "symbol",
        source: "698bf11cc5216bc71ba8d53f",
        "source-layer": "698bf11cc5216bc71ba8d53f",
        layout: {
          "text-field": [
            "format",
            ["get", "pipetype"],
            {},
            "\n",
            {},
            ["get", "pipesize"],
            {},
          ],
          "text-size": 14,
          "text-anchor": "center",
          "text-offset": [0, 1],
        },
        paint: {
          "text-color": "#000",
          "text-halo-color": "#fff",
          "text-halo-width": 1,
        },
      });
      // e.target.addSource("contours", {
      //   type: "vector",
      //   url: "https://api.maptiler.com/tiles/contours/tiles.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL",
      // });
      // e.target.addLayer({
      //   id: "contour-lines",
      //   type: "line",
      //   source: "contours",
      //   "source-layer": "contour",
      //   layout: {
      //     "line-join": "round",
      //     "line-cap": "round",
      //   },
      //   paint: {
      //     "line-color": "#ff69b4",
      //     "line-width": 1,
      //   },
      // });
      // e.target.addSource("pipe", {
      //   type: "vector",
      //   url: "https://app.vallarismaps.com/core/api/tiles/1.0-beta/tiles/699803ec7ecb1e590bff5b5c?api_key=Y9TeAcfoHoT3RKGW44za0T1dF4bYHaOScEXy8cCLbUEDOtqXolbRSq7S3C2hkDAv",
      // });
      // e.target.addLayer({
      //   id: "pipe",
      //   type: "line",
      //   source: "pipe",
      //   "source-layer": "699803ec7ecb1e590bff5b5c",
      //   layout: {
      //     "line-join": "round",
      //     "line-cap": "round",
      //   },
      //   paint: {
      //     "line-color": "#ff69b4",
      //     "line-width": 4,
      //   },
      // });
      // setlayerList([
      //   {
      //     id: "pipe",
      //     status: true,
      //     opacity: 1,
      //   },
      // ]);

      // ปรับการแสดงผลตามเงื่อนไข

      // e.target?.setPaintProperty("flow_meter", "circle-color", [
      //   "case",
      //   ["==", ["to-number", ["get", "metersize"]], 4],
      //   "red",
      //   [">", ["to-number", ["get", "metersize"]], 5],
      //   "yellow",
      //   "green",
      // ]);
      // e.target?.setPaintProperty("pipe", "line-color", [
      //   "case",
      //   ["<", ["-", 2569, ["get", "year"]], 20],
      //   "#000000", // อายุน้อยกว่า 20 ปี → ดำ
      //   "#ff0000", // มากกว่า/เท่ากับ 20 ปี → แดง
      // ]);
      // e.target?.setFilter("pipe", [
      //   "any",
      //   ["all", ["!=", "custcode", "10610000297"]],
      // ]);
      //   [
      //   "all",
      //   [">=", ["get", "metersize"], 4],
      //   ["<=", ["get", "metersize"], 6]
      // ],
      //metersize
    });

    // event เมื่อ แผนที่ rotate
    initMap.on("rotate", (e) => {
      setrotate(e.target.getBearing());
    });

    // get ค่า lat lng ตอน mouse move
    initMap.on("mousemove", (e) => {
      if (e.lngLat) {
        setmouseLocation(e?.lngLat);
      }
    });
  }, []);

  // useEffect สำหรับ enable ปุ่ม save
  useEffect(() => {
    map?.on("draw.create", () => {
      setmodeStatus((p: any) => {
        return { ...p, canSave: true };
      });
    });

    map?.on("draw.update", () => {
      setmodeStatus((p: any) => {
        return { ...p, canSave: true };
      });
    });

    return () => {
      map?.off("draw.create", () => {
        setmodeStatus((p: any) => {
          return { ...p, canSave: true };
        });
      });

      map?.off("draw.update", () => {
        setmodeStatus((p: any) => {
          return { ...p, canSave: true };
        });
      });
    };
  }, [draw, map]);

  // useEffect สำหรับ feature ที่สร้างขึ้นมาใหม่
  useEffect(() => {
    const onCreate = (e: any) => {
      const feature = e.features[0];
      draw?.setFeatureProperty(feature.id, "name", "PWA");
      draw?.setFeatureProperty(feature.id, "description", "PWA-WORKSHOP");
      draw?.setFeatureProperty(feature.id, "_remove_create", true);
      draw?.setFeatureProperty(feature.id, "_remove_type", featureType);
    };

    map?.on("draw.create", onCreate);

    return () => {
      map?.off("draw.create", onCreate);
    };
  }, [map, draw, featureType]);
  //useEffect สำหรับ enable ปุ่ม set attribute
  useEffect(() => {
    const onSelect = (e: any) => {
      const selectedFeatures = e.features;

      if (selectedFeatures.length > 0) {
        setmodeStatus((p: any) => {
          return { ...p, selected: true };
        });
      } else {
        setmodeStatus((p: any) => {
          return { ...p, selected: false };
        });
      }
    };
    // event ตอนที่มีการเลือก feature ฝั่ง mapboxDraw
    map?.on("draw.selectionchange", onSelect);

    return () => {
      map?.off("draw.selectionchange", onSelect);
    };
  }, [map]);

  useEffect(() => {
    const onClick = (e: any) => {
      const features: any = map?.queryRenderedFeatures(e.point);
      const filterfeatures = features.filter(
        (x: any) =>
          x.layer.id === "step_test" ||
          x.layer.id === "flow_meter" ||
          x.layer.id === "dma_boundary" ||
          x.layer.id === "pipe",
        // ["step_test", "flow_meter", "dma_boundary"].includes(x.layer.id),
      );

      if (filterfeatures?.length > 1) {
        setselectFeature(filterfeatures);
        setmodeStatus((p: any) => {
          return { ...p, selected: true };
        });
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
        setmodeStatus((p: any) => {
          return { ...p, selectMode: false, selected: true };
        });
      }
    };

    const onClickWithoutSelect = (e: any) => {
      const query = e.target.queryRenderedFeatures(e.point);

      if (query?.length) {
        const coordinates: any = [e.lngLat.lng, e.lngLat.lat].slice();

        new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(
            `<div class="flex flex-col space-y-2">
           ${query
             .map((q: any) => {
               return `<div key={q.id}><p>${q.layer.id}</p></div>`;
             })
             .join("")}
            </div>`,
          )
          .addTo(map);
      }
    };

    if (modeStatus.selectMode) {
      //เงื่อนไขเมื่อเลือก tile เพื่อเปลี่ยนเป็น feature
      map?.on("click", onClick);
    } else {
      //เงื่อนไขที่จะแสดง popup แสดง properties
      map?.on("click", onClickWithoutSelect);
    }

    return () => {
      if (modeStatus.selectMode) {
        map?.off("click", onClick);
      } else {
        map?.off("click", onClickWithoutSelect);
      }
    };
  }, [map, modeStatus.selectMode]);

  const onSelectFeature = (feature: any) => {
    map?.setFilter(feature.layer.id, [
      "any",
      ["all", ["!=", "_id", feature.properties._id]],
    ]);
    let add = feature;
    add.properties[`_remove_type`] = feature.layer.id;

    draw?.add(add);
    draw?.changeMode("simple_select", { featureIds: feature.id });
    setselectFeature([]);
    setmodeStatus((p: any) => {
      return { ...p, selectMode: false, selected: true };
    });
  };
  const onSave = () => {
    const allFeature = draw?.getAll();

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

    // const Delete = {
    //   type: "FeatureCollection",
    //   features: deleteFeature,
    // };

    deleteFeature.map((x: any) => {
      if (x.type === "step_test") {
        delete x.type;

        const Delete = fetch(`/colection/step_test/items`, {
          body: JSON.stringify(x),
        });
      } else if (x.type === "flow_meter") {
        delete x.type;
        const Delete = fetch(`/colection/flow_meter/items`, {
          body: JSON.stringify(x),
        });
      } else if (x.type === "dma_boundary") {
        delete x.type;
        const Delete = fetch(`/colection/dma_boundary/items`, {
          body: JSON.stringify(x),
        });
      }
    });

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
    setloading(true);
    const allFeature = draw?.getAll();

    const boundingBox = turf.bbox(allFeature);

    const get = await fetch(
      `${process.env.NEXT_PUBLIC_PWA_HOST}/collections/dma_boundary/items?bbox=${boundingBox.join(",")}`,
    ).then(async (response) => {
      return { status: response.status, result: await response.json() };
    });

    if (get?.result?.features?.length && get?.result?.features[0]) {
      const f = get?.result?.features[0];
      const check = allFeature.features.map((x: any) => {
        const intersect = turf.booleanIntersects(x, f);

        return { status: intersect, id: x.id };
      });

      console.log(check);
      if (check.includes(true)) {
        console.log("ทับ");
        setloading(false);
      } else {
        console.log("ไม่ทับ");
        setloading(false);
      }
      //turf.booleanIntersects(line, point1);
    } else {
      console.log("สำเร็จ");
      setloading(false);
    }

    // console.log(turf.bbox(allFeature));

    // const [minLon, minLat, maxLon, maxLat] = turf.bbox(allFeature);

    // const minCoord = map.project([minLon, minLat]); // or [minLon, minLat];
    // const maxCoord = map.project([maxLon, maxLat]); // or [maxLon, maxLat];

    // const bound = [minCoord, maxCoord];

    // const features = map?.queryRenderedFeatures(bound, {
    //   layers: ["dma_boundary"],
    // });

    // console.log(features);

    // console.log(features);

    // layers: "flow_meter",
  };

  const onDelete = () => {
    const selectfeature = draw?.getSelected();

    const remove = selectfeature?.features.map((x: any) => {
      draw?.delete(x.id);

      return { id: x.properties._id, type: x.properties._remove_type };
    });
    setdeleteFeature(remove);
    //   const feature = draw?.getSelectedIds();

    // draw?.delete(feature);
  };

  const memoLayer = useMemo(() => layerList, [layerList]);

  // useEffect event mouseenter / mouseleave ที่ tile เพื่อทำงานฟังก์ชนที่ต้องการ
  useEffect(() => {
    map?.on("mouseenter", "FLOW_METER", (e: any) => {
      // เปลี่นนการแสดงผล cursor
      e.target.getCanvas().style.cursor = "move";
    });

    map?.on("mouseleave", "FLOW_METER", (e: any) => {
      e.target.getCanvas().style.cursor = "";
    });
  }, [map]);

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
                    className="border rounded-2xl p-2"
                  >
                    <div className="grid grid-cols-2">
                      <p className="grid text-sm"> ชั้นข้อมูล</p>

                      <p className="grid text-sm"> {x.layer.id}</p>
                    </div>

                    {Object.keys(x?.properties)
                      .filter((s: any) => !s.startsWith("_"))
                      .map((l: any) => {
                        return (
                          <div key={l} className="grid grid-cols-2">
                            <p className="grid text-sm"> {l}</p>

                            <p className="grid text-sm font-light">
                              {x?.properties[l] ? x?.properties[l] : ""}
                            </p>
                          </div>
                        );
                      })}

                    <div className="flex justify-end">
                      <Button
                        className="mt-2"
                        onClick={() => {
                          onSelectFeature(x);
                        }}
                      >
                        เลือก
                      </Button>
                    </div>
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
            <DialogTitle>คุณลักษณะ</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="flex flex-col space-y-1">
              {Object.keys(editFeature ? editFeature?.properties : {})
                .filter((s: any) => !s.startsWith("_"))
                .map((l: any) => {
                  return (
                    <div key={l} className="flex flex-col space-y-1">
                      <p className="text-sm">{l}</p>
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
            </div>
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
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {mouseLocation ? (
        <div className="bg-white rounded-lg absolute bottom-2 left-2 flex flex-row space-x-2 z-10 p-2">
          <p className="text-sm">
            {`ละติจูด : ${mouseLocation.lat?.toFixed(6)}`}
          </p>

          <p className="text-sm">
            {`ลองติจูด : ${mouseLocation.lng?.toFixed(6)}`}
          </p>
        </div>
      ) : null}

      <div className="absolute z-10 top-2 left-2 flex flex-row space-x-2">
        <Button
          onClick={() => {
            setmodeStatus((p: any) => {
              return { ...p, selectMode: !p.selectMode };
            });
          }}
        >
          {modeStatus.selectMode ? "Cancel Select" : "Select Feature"}
        </Button>
        <Button
          disabled={Boolean(modeStatus.selectMode)}
          onClick={() => {
            draw?.changeMode("draw_point");
            setfeatureType("flow_meter");
          }}
        >
          <div className="flex flex-row space-x-2 items-center">
            <Pencil /> <p className="text-sm">flow meter</p>
          </div>
        </Button>

        <Button
          disabled={Boolean(modeStatus.selectMode)}
          onClick={() => {
            draw?.changeMode("draw_polygon");
            setfeatureType("dma_boundary");
          }}
        >
          <div className="flex flex-row space-x-2 items-center">
            <Pencil /> <p className="text-sm">dma boundary</p>
          </div>
        </Button>

        <Button
          disabled={Boolean(modeStatus.selectMode)}
          onClick={() => {
            draw?.changeMode("draw_polygon");
            setfeatureType("step_test");
          }}
        >
          <div className="flex flex-row space-x-2 items-center">
            <Pencil /> <p className="text-sm">step test</p>
          </div>
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size={"icon"}
              disabled={Boolean(modeStatus.selectMode || !modeStatus.selected)}
              onClick={() => {
                onDelete();
              }}
            >
              <Trash2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">ลบ</p>
          </TooltipContent>
        </Tooltip>

        {/* <Button
          disabled={Boolean(selectMode)}
          onClick={() => {
            draw?.deleteAll();
          }}
        >
          Delete All
        </Button> */}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size={"icon"}
              disabled={Boolean(modeStatus.selectMode || !modeStatus.selected)}
              onClick={() => {
                const feature = draw?.getSelected();

                if (feature.features[0]) {
                  seteditFeature(feature.features[0]);
                }
              }}
            >
              <Sheet />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">คุณลักษณะ</p>
          </TooltipContent>
        </Tooltip>

        {/* <Button
          disabled={Boolean(selectMode || loading)}
          onClick={() => {
            onCheck();
          }}
        >
          Check
        </Button> */}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              disabled={Boolean(loading || !modeStatus.canSave)}
              size={"icon"}
              onClick={() => {
                onSave();
              }}
            >
              <Save />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">บันทึก</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="absolute z-10 right-2 top-1/2 -translate-y-1/2 flex flex-col space-y-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button size={"icon"}>
              <Layers />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="space-y-2">
            <PopoverHeader>
              <PopoverTitle>Layer Control</PopoverTitle>
            </PopoverHeader>

            {memoLayer.map((x: any, index: any) => {
              return (
                <div className="flex flex-col space-y-2" key={`${x.id}`}>
                  <div className="flex flex-row justify-between">
                    <div className="flex flex-row space-x-2 items-center">
                      <Switch
                        checked={Boolean(x?.status)}
                        onCheckedChange={(b: boolean) => {
                          if (map?.getLayer(x.id)) {
                            map?.setLayoutProperty(
                              x.id,
                              "visibility",
                              b ? "visible" : "none",
                            );
                            let update = layerList;
                            update[index].status = b;
                            setlayerList(update);
                          }
                        }}
                      />

                      <p className="text-sm">{x.id}</p>
                    </div>

                    <Button
                      variant={"ghost"}
                      onClick={() => {
                        setcollape(collape === index ? undefined : index);
                      }}
                    >
                      <Settings />
                    </Button>
                  </div>

                  <Collapsible
                    open={Boolean(
                      typeof collape === "number" && collape === index,
                    )}
                  >
                    <CollapsibleContent>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-light">ความโปร่งใส</p>
                        <Slider
                          defaultValue={[x.opacity]}
                          max={1}
                          step={0.1}
                          onValueChange={(value: number[]) => {
                            if (map?.getLayer(x.id)) {
                              map?.setPaintProperty(
                                x.id,
                                "line-opacity",
                                value[0],
                              );
                              let update = layerList;
                              update[index].opacity = value[0];
                              setlayerList(update);
                            }
                          }}
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            })}
          </PopoverContent>
        </Popover>

        <Button
          size={"icon"}
          onClick={() => {
            map?.zoomIn();
          }}
        >
          <Plus />
        </Button>
        <Button
          size={"icon"}
          onClick={() => {
            map?.zoomOut();
          }}
        >
          <Minus />
        </Button>

        <Button
          size={"icon"}
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
