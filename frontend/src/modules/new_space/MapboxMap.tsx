import { FC, useMemo } from "react";
import MapboxGL, { LineLayer, FillLayer, ShapeSource } from "@rnmapbox/maps";
import { StyleProp, View, ViewStyle, useWindowDimensions } from "react-native";
import { Location } from "../../types";
import { calculateFontSize } from "./utils";
import { minRadiusForBounds } from "./constants";
import { Text } from "../../components/Text";
import { Map } from "../../components/Map";
import { createGeoJSONCircle } from "../../utils/map";
import { hexToRgb } from "../../utils/hex_to_rgb";
import { template } from "../../styles/template";

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!);

export const MapboxMap: FC<{
  radius: number;
  spaceName?: string;
  location: Location;
  color: string;
  aspectRatio?: number;
  style?: StyleProp<ViewStyle>;
}> = ({
  radius,
  spaceName = "Your space",
  location,
  color,
  style,
  aspectRatio = 1.8,
}) => {
  const { width: screenWidth } = useWindowDimensions();

  const geoJSONCircle = useMemo(
    () => createGeoJSONCircle(location, radius, 60),
    [location, radius]
  );

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
    <Map
      radius={radius < minRadiusForBounds ? minRadiusForBounds : radius}
      aspectRatio={aspectRatio}
      style={style}
      centerCoordinate={location}
    >
      <>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{
              fontSize: spaceNameTextFontsize,
              color,
              fontWeight: template.fontWeight.bold,
              maxWidth: spaceNameTextMaxWidth,
              textAlign: "center",
            }}
          >
            {spaceName}
          </Text>
        </View>
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
            style={{ lineColor: hexToRgb(color, 0.22), lineWidth: 1 }}
          />
        </ShapeSource>
      </>
    </Map>
  );
};
