// the north/south bounds encompass the radius plus radius/2 padding
export const getBoundingBox = (
  center: number[],
  radius: number,
  aspectRatio: number
) => {
  const [longitude, latitude] = center;
  const radiusInDegreesLatitude = (radius / 111000) * 1.5; // Convert radius to degrees (approx) * 1.5 (for padding).
  const radiusInDegreesLongitude = radiusInDegreesLatitude * aspectRatio;

  const north = latitude + radiusInDegreesLatitude;
  const south = latitude - radiusInDegreesLatitude;
  const east =
    longitude + radiusInDegreesLongitude / Math.cos((latitude * Math.PI) / 180);
  const west =
    longitude - radiusInDegreesLongitude / Math.cos((latitude * Math.PI) / 180);

  return { sw: [west, south], ne: [east, north] };
};
