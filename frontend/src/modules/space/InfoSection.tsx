import { Location } from "../../types";
import React, { FC, ReactNode, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { template } from "../../styles/template";
import { Map } from "../../components/Map";
import { FillLayer, LineLayer, ShapeSource } from "@rnmapbox/maps";
import { createGeoJSONCircle } from "../../utils/map";
import { hexToRgb } from "../../utils/hex_to_rgb";
import { Text } from "../../components/Text";

const color = template.colors.purple;

export const InfoSection: FC<{
  location: Location;
  radius: number;
  spaceMembers: any[];
}> = ({ location, radius, spaceMembers }) => {
  const geoJSONCircle = useMemo(
    () => createGeoJSONCircle(location, radius, 60),
    [location, radius]
  );

  return (
    <View style={{ position: "relative" }}>
      <Overlay>
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
          <SpaceMembers spaceMembers={spaceMembers} />
          <Text style={{ color: template.colors.text }}>3 others online</Text>
        </View>
      </Overlay>
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

const SpaceMembers: FC<{ spaceMembers: any[] }> = ({ spaceMembers }) => {
  return (
    <View
      style={{
        flexDirection: "row",
      }}
    >
      {spaceMembers.map((_, index) => {
        return (
          <View
            key={index}
            style={{
              height: 32,
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
  );
};

const Overlay: FC<{ children: ReactNode }> = ({ children }) => {
  return (
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
      {children}
    </View>
  );
};
