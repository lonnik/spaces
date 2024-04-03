export const metersToLatitudeDelta = (meters: number, latitude: number) => {
  const earthRadiusKm = 6371;
  return (
    (meters / 1000 / ((earthRadiusKm * Math.PI) / 180)) *
    Math.abs(Math.cos(latitude * (Math.PI / 180)))
  );
};

export const calculateLongitudeDelta = (
  latitudeDelta: number,
  latitude: number
) => {
  const radianConversionFactor = Math.PI / 180;
  return latitudeDelta * Math.cos(latitude * radianConversionFactor);
};
