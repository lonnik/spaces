import { FC, useCallback, useEffect, useMemo, useState } from "react";
import MapboxGL, {
  Camera,
  MapView,
  LineLayer,
  FillLayer,
  ShapeSource,
} from "@rnmapbox/maps";
import { StyleProp, View, ViewStyle, useWindowDimensions } from "react-native";
import { Location } from "../../types";
import { debounce } from "../../utils/debounce";
import {
  calculateFontSize,
  createGeoJSONCircle,
  getBoundingBox,
} from "./utils";
import { minRadiusForBounds } from "./constants";
import { Text } from "../../components/Text";

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!);

export const MapboxMap: FC<{
  radius: number;
  spaceName?: string;
  location: Location;
  color: string;
  style?: StyleProp<ViewStyle>;
}> = ({ radius, spaceName = "Your space", location, color, style }) => {
  const aspectRatio = 1.5;

  const { width: screenWidth } = useWindowDimensions();

  const centerCoordinate = useMemo(
    () => [location.longitude, location.latitude],
    [location.latitude, location.longitude]
  );

  const [bounds, setBounds] = useState(
    getBoundingBox(centerCoordinate, radius, aspectRatio)
  );

  const debouncedSetBounds = useCallback(
    debounce((radius: number) => {
      const bounds = getBoundingBox(centerCoordinate, radius, aspectRatio);
      setBounds(bounds);
    }, 40),
    [centerCoordinate]
  );

  useEffect(() => {
    debouncedSetBounds(radius);
  }, [radius, debouncedSetBounds]);

  const geoJSONCircle = createGeoJSONCircle(centerCoordinate, radius, 60);

  // TODO: adapt to aspect ratio of not 1
  const spaceNameTextMaxWidth =
    170 * Math.min(radius / minRadiusForBounds, 1) * (screenWidth / 430);

  const spaceNameTextFontsize = calculateFontSize(
    spaceName,
    spaceNameTextMaxWidth,
    16,
    40
  );

  return (
    <View
      style={[
        {
          width: "100%",
          aspectRatio,
          borderRadius: 10,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <MapView
        style={{ flex: 1 }}
        logoEnabled={false}
        scaleBarEnabled={false}
        zoomEnabled={false}
        scrollEnabled={false}
        attributionEnabled={false}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{
              fontSize: spaceNameTextFontsize,
              color,
              fontWeight: "600",
              maxWidth: spaceNameTextMaxWidth,
              textAlign: "center",
            }}
          >
            {spaceName}
          </Text>
        </View>
        <Camera bounds={bounds} animationDuration={100} />
        <ShapeSource id="circleSource" shape={geoJSONCircle} tolerance={0.1}>
          <FillLayer
            id="circleFill"
            style={{
              fillColor: color,
              fillOpacity: 0.18,
            }}
          />
          <LineLayer
            id="circleLine"
            style={{ lineColor: color, lineWidth: 1 }}
          />
        </ShapeSource>
      </MapView>
    </View>
  );
};
