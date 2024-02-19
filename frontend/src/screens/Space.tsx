import { StackScreenProps } from "@react-navigation/stack";
import { Location, RootStackParamList } from "../types";
import { FC, useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getSpaceById } from "../utils/queries";
import { LoadingScreen } from "./Loading";
import { Header } from "../components/Header";
import { template } from "../styles/template";
import { Map } from "../components/Map";
import { FillLayer, LineLayer, ShapeSource } from "@rnmapbox/maps";
import { createGeoJSONCircle } from "../utils/map";
import { hexToRgb } from "../utils/hex_to_rgb";
import { Text } from "../components/Text";

const color = template.colors.purple;

// TODO info component:
// extract component
// use pressable
// use animated for pressing effect
// clean up positioning
// improve function for radius calculation

// TODO:
// improve loading/error screen
// join button

export const SpaceScreen: FC<StackScreenProps<RootStackParamList, "Space">> = ({
  route,
}) => {
  const { spaceId } = route.params;

  const { data: space, isLoading } = useQuery({
    queryKey: ["spaces", spaceId],
    queryFn: () => getSpaceById(spaceId),
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Header text={`${space?.name} 🏠`} />
      <ScrollView
        style={{
          flex: 1,
          paddingHorizontal: template.paddings.md,
          flexDirection: "column",
        }}
      >
        <InfoSection location={space?.location!} radius={space?.radius!} />
      </ScrollView>
    </View>
  );
};

const InfoSection: FC<{ location: Location; radius: number }> = ({
  location,
  radius,
}) => {
  const geoJSONCircle = useMemo(
    () => createGeoJSONCircle(location, radius, 60),
    [location, radius]
  );

  return (
    <View style={{ position: "relative" }}>
      <View
        style={[
          {
            justifyContent: "space-between",
            paddingHorizontal: 10,
            paddingVertical: 10,
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            zIndex: 10,
            borderRadius: 10,
            overflow: "hidden",
          },
          StyleSheet.absoluteFillObject,
        ]}
      >
        <View style={{ alignSelf: "flex-end" }}>
          <Text>join</Text>
        </View>
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              height: 32,
              flexDirection: "row",
            }}
          >
            {Array.from({ length: 9 }).map((_, index) => {
              return (
                <View
                  key={index}
                  style={{
                    height: "100%",
                    aspectRatio: 1,
                    backgroundColor: template.colors.gray,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: "#aaa",
                    marginRight: -10,
                  }}
                />
              );
            })}
          </View>
          <Text style={{}}>3 others online</Text>
        </View>
      </View>
      <Map
        radius={20}
        aspectRatio={3}
        centerCoordinate={location}
        style={{
          borderRadius: 10,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: template.colors.gray,
        }}
      >
        <ShapeSource id="circleSource" shape={geoJSONCircle} tolerance={0.1}>
          <FillLayer
            id="circleFill"
            style={{
              fillColor: hexToRgb(color, 0.18),
              fillOpacity: 1,
            }}
          />
          <LineLayer
            id="circleLine"
            style={{ lineColor: hexToRgb(color, 0.25), lineWidth: 1 }}
          />
        </ShapeSource>
      </Map>
    </View>
  );
};
