import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Location } from "../../types";
import MapView, { Circle } from "react-native-maps";
import {
  calculateLongitudeDelta,
  metersToLatitudeDelta,
} from "../../utils/meters_to_latitude_delta";

const mapWidthToRadius = 3;
const minLatitudeDelta = 0.001;

export const RnMap: FC<{ location: Location; radius: number }> = ({
  location,
  radius,
}) => {
  const { latitude, longitude } = location;

  const initialDeltas = useMemo(() => {
    return {
      latitudeDelta: minLatitudeDelta,
      longitudeDelta: calculateLongitudeDelta(minLatitudeDelta, latitude),
    };
  }, []);

  const [deltas, setDeltas] = useState(initialDeltas);

  const setDeltasForRadius = useCallback((newRadius: number) => {
    const latitudeDelta =
      newRadius < 30
        ? minLatitudeDelta
        : metersToLatitudeDelta(newRadius * 2, latitude) * mapWidthToRadius;

    const longitudeDelta =
      latitudeDelta *
      (initialDeltas.longitudeDelta / initialDeltas.latitudeDelta) *
      mapWidthToRadius;

    setDeltas({
      latitudeDelta,
      longitudeDelta,
    });
  }, []);

  useEffect(() => {
    setTimeout(() => setDeltasForRadius(radius), 250);
  }, [radius]);

  return (
    <MapView
      style={{
        width: "100%",
        aspectRatio: 1,
      }}
      region={{
        latitude,
        longitude,
        latitudeDelta: deltas.latitudeDelta,
        longitudeDelta: deltas.longitudeDelta,
      }}
      scrollEnabled={false}
      zoomEnabled={false}
    >
      <Circle
        center={{ latitude, longitude }}
        radius={radius}
        fillColor="#aaa5"
        strokeColor="#faa"
        strokeWidth={1}
      />
    </MapView>
  );
};
