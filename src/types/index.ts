import { Point } from "ol/geom";
import { Coordinate } from "ol/coordinate";
import { Vector as VectorSource } from "ol/source";
import Feature from "ol/Feature";

export interface VectorLabelOptions {
  coordinate: Coordinate;
  vectorSource: VectorSource<Feature<Point>> | null;
  name?: string;
  imageUrl?: string;
}
