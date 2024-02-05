import { FC, useCallback, useEffect, useMemo, useState } from "react";
import MapboxGL, { Camera, MapView } from "@rnmapbox/maps";
import { StyleProp, View, ViewStyle, useWindowDimensions } from "react-native";
import { Location } from "../../types";
import { debounce } from "../../utils/debounce";
import {
  calculateFontSize,
  createGeoJSONCircle,
  getBoundingBox,
} from "./utils";
import { minRadiusForBounds } from "./constants";
import { template } from "../../styles/template";
import { Text } from "../../components/Text";

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!);

export const MapboxMap: FC<{
  radius: number;
  spaceName?: string;
  location: Location;
  style?: StyleProp<ViewStyle>;
}> = ({ radius, spaceName = "Your space", location, style }) => {
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
    170 * Math.min(radius / minRadiusForBounds, 1) * (screenWidth / 430);

  const spaceNameTextFontsize = calculateFontSize(
    spaceName,
    spaceNameTextMaxWidth,
    16,
    40
  );

  return (
    <View style={[{ width: "100%", aspectRatio: 1 }, style]}>
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
              color: template.colors.text,
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
              fillColor: template.colors.lila,
              fillOpacity: 0.14,
            }}
          />
          <MapboxGL.LineLayer
            id="circleLine"
            style={{ lineColor: template.colors.lila, lineWidth: 1 }}
          />
        </MapboxGL.ShapeSource>
      </MapView>
    </View>
  );
};
