import React, { FC, useState } from "react";
import { Pressable, StyleProp, View, ViewStyle } from "react-native";
import { template } from "../../styles/template";
import { Text } from "../../components/Text";
import { useNotification } from "../../utils/notifications";
import { PressableOverlay } from "../../components/PressableOverlay";
import { hexToRgb } from "../../utils/hex_to_rgb";

export const InfoSection: FC<{
  spaceMembers: any[];
  onPress: () => void;
  spaceName: string;
  style?: StyleProp<ViewStyle>;
}> = ({ spaceMembers, onPress, style, spaceName }) => {
  const [joined, setJoined] = useState(false);

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
    <PressableOverlay onPress={onPress} style={style}>
      <View
        style={{
          flex: 1,
          padding: 10,
          backgroundColor: template.colors.purpleLightBackground,
          borderRadius: template.borderRadius.md,
        }}
      >
        <Text
          style={{
            fontSize: 32,
            marginBottom: 20,
            fontWeight: "600",
            color: hexToRgb(template.colors.purple, 0.7),
          }}
        >
          {spaceName}
        </Text>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <SpaceMembers spaceMembers={spaceMembers} />
          <Text style={{ color: template.colors.textLight }}>
            3 others online
          </Text>
        </View>
      </View>
    </PressableOverlay>
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
        {userHasJoined ? "subscribed" : "subscribe"}
      </Text>
    </Pressable>
  );
};

export const SpaceMembers: FC<{ spaceMembers: any[] }> = ({ spaceMembers }) => {
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
