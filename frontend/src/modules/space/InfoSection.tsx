import { Location } from "../../types";
import React, { FC, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { template } from "../../styles/template";
import { Map } from "../../components/Map";
import { FillLayer, LineLayer, ShapeSource } from "@rnmapbox/maps";
import { createGeoJSONCircle } from "../../utils/map";
import { hexToRgb } from "../../utils/hex_to_rgb";
import { Text } from "../../components/Text";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useNotification } from "../../utils/notifications";

const color = template.colors.purple;

export const InfoSection: FC<{
  location: Location;
  radius: number;
  spaceMembers: any[];
}> = ({ location, radius, spaceMembers }) => {
  const [joined, setJoined] = useState(false);

  const isPressedSv = useSharedValue(false);

  const animatedOpacity = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isPressedSv.value ? 0.1 : 0, { duration: 100 }),
    };
  });

  const notification = useNotification();

  const handleJoin = () => {
    if (joined) {
      notification.showNotification({
        title: "Left",
        description: "You have left the space",
        type: "info",
      });
    } else {
      notification.showNotification({
        title: "Joined",
        description: "You have joined the space",
        type: "success",
      });
    }

    setJoined((oldJoined) => !oldJoined);
  };

  return (
    <Pressable
      onPressIn={() => {
        isPressedSv.value = true;
      }}
      onPressOut={() => {
        isPressedSv.value = false;
      }}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: "black",
            pointerEvents: "none",
            borderRadius: 10,
            overflow: "hidden",
            zIndex: 1,
          },
          animatedOpacity,
        ]}
      />
      <Animated.View style={[{ position: "relative" }]}>
        <View
          style={[
            {
              justifyContent: "space-between",
              paddingHorizontal: 10,
              paddingVertical: 10,
              backgroundColor: "rgba(255, 255, 255, 0.4)",
              zIndex: 10,
              borderRadius: 10,
              overflow: "hidden",
            },
            StyleSheet.absoluteFillObject,
          ]}
        >
          <JoinButton onPress={handleJoin} userHasJoined={joined} />
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
        </View>
        <BackgroundMap location={location} radius={radius} />
      </Animated.View>
    </Pressable>
  );
};

const JoinButton: FC<{ userHasJoined: boolean; onPress: () => void }> = ({
  userHasJoined,
  onPress,
}) => {
  return (
    <Pressable
      hitSlop={10}
      onPress={onPress}
      style={{
        alignSelf: "flex-end",
        paddingVertical: 9,
        paddingHorizontal: 15,
        borderRadius: 8,
        backgroundColor: userHasJoined
          ? template.colors.white
          : template.colors.purple,
        borderWidth: 1,
        borderColor: userHasJoined ? template.colors.purple : "transparent",
      }}
    >
      <Text
        style={{
          color: userHasJoined ? template.colors.purple : template.colors.white,
          fontWeight: "500",
          fontSize: 15,
          letterSpacing: 1,
        }}
      >
        {userHasJoined ? "joined" : "join"}
      </Text>
    </Pressable>
  );
};

const BackgroundMap: FC<{ location: Location; radius: number }> = ({
  location,
  radius,
}) => {
  const geoJSONCircle = createGeoJSONCircle(location, radius, 60);

  return (
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
