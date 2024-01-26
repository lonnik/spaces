import { circle } from "@turf/turf";
import { minRadiusForBounds } from "./constants";

export const createGeoJSONCircle = (
  center: number[],
  radiusM: number,
  steps: number
) => {
  return circle(center, radiusM, { steps, units: "meters" });
};

export const getBoundingBox = (center: number[], radius: number) => {
  if (radius < minRadiusForBounds) {
    radius = minRadiusForBounds;
  }

  const [longitude, latitude] = center;
  const radiusInDegrees = (radius / 111000) * 2; // Convert radius to degrees (approx) * 2 (for padding)

  const north = latitude + radiusInDegrees;
  const south = latitude - radiusInDegrees;
  const east =
    longitude + radiusInDegrees / Math.cos((latitude * Math.PI) / 180);
  const west =
    longitude - radiusInDegrees / Math.cos((latitude * Math.PI) / 180);

  return { sw: [west, south], ne: [east, north] };
};

export const calculateFontSize = (
  text: string,
  maxWidth: number,
  minFontSize: number,
  maxFontSize: number
) => {
  const length = text.length;
  let fontSize = maxWidth / length;

  fontSize = Math.max(minFontSize, fontSize);
  return Math.min(maxFontSize, fontSize);
};
