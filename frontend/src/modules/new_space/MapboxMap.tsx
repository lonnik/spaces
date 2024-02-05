import { FC, useCallback, useEffect, useMemo, useState } from "react";
import MapboxGL, { Camera, MapView } from "@rnmapbox/maps";
import { Text, View, useWindowDimensions } from "react-native";
import { Location } from "../../types";
import { debounce } from "../../utils/debounce";
import {
  calculateFontSize,
  createGeoJSONCircle,
  getBoundingBox,
} from "./utils";
import { minRadiusForBounds } from "./constants";

// TODOS:
// try out on phone
// custom design

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!);

export const MapboxMap: FC<{
  radius: number;
  spaceName?: string;
  location: Location;
}> = ({ radius, spaceName = "Your space", location }) => {
  const { width: screenWidth } = useWindowDimensions();

  const centerCoordinate = useMemo(
    () => [location.longitude, location.latitude],
    [location.latitude, location.longitude]
  );

  const [bounds, setBounds] = useState(
    getBoundingBox(centerCoordinate, radius)
  );

  const debouncedSetBounds = useCallback(
    debounce((radius: number) => {
      const bounds = getBoundingBox(centerCoordinate, radius);
      setBounds(bounds);
    }, 40),
    [centerCoordinate]
  );

  useEffect(() => {
    debouncedSetBounds(radius);
  }, [radius, debouncedSetBounds]);

  const geoJSONCircle = createGeoJSONCircle(centerCoordinate, radius, 120);

  const spaceNameTextMaxWidth =
    200 * Math.min(radius / minRadiusForBounds, 1) * (screenWidth / 430);
  const spaceNameTextFontsize = calculateFontSize(
    spaceName,
    spaceNameTextMaxWidth,
    20,
    40
  );

  return (
    <View style={{ width: "100%", aspectRatio: 1 }}>
      <MapView
        style={{ flex: 1 }}
        logoEnabled={false}
        scaleBarEnabled={false}
        zoomEnabled={false}
        scrollEnabled={false}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{
              fontSize: spaceNameTextFontsize,
              color: "#500",
              fontWeight: "600",
              maxWidth: spaceNameTextMaxWidth,
              textAlign: "center",
            }}
          >
            {spaceName}
          </Text>
        </View>
        <Camera bounds={bounds} animationDuration={100} />
        <MapboxGL.ShapeSource id="circleSource" shape={geoJSONCircle}>
          <MapboxGL.FillLayer
            id="circleFill"
            style={{
              fillColor: "#ff0000",
              fillOpacity: 0.3,
            }}
          />
          <MapboxGL.LineLayer
            id="circleLine"
            style={{ lineColor: "#700", lineWidth: 1 }}
          />
        </MapboxGL.ShapeSource>
      </MapView>
    </View>
  );
};
