import React, { FC, useState } from "react";
import { Pressable, StyleProp, View, ViewStyle } from "react-native";
import { template } from "../../styles/template";
import { Text } from "../../components/Text";
import { useNotification } from "../../utils/notifications";
import { hexToRgb } from "../../utils/hex_to_rgb";
import { Uuid } from "../../types";
import { useQueries } from "@tanstack/react-query";
import { getSpaceSubscribers } from "../../utils/queries";
import { Avatar } from "../../components/Avatar";
import { PressableTransformation } from "../../components/PressableTransformation";

export const InfoSection: FC<{
  onPress: () => void;
  spaceName: string;
  spaceId: Uuid;
  style?: StyleProp<ViewStyle>;
}> = ({ onPress, style, spaceName, spaceId }) => {
  const [joined, setJoined] = useState(false);

  let [{ data: activeSpaceSubscribers }, { data: inactiveSpaceSubscribers }] =
    useQueries({
      queries: [
        {
          queryKey: ["spaces", spaceId, "subscribers", "active"],
          queryFn: async () => getSpaceSubscribers(spaceId, true, 0, 999),
        },
        {
          queryKey: ["spaces", spaceId, "subscribers", "inactive"],
          queryFn: async () => getSpaceSubscribers(spaceId, false, 0, 8),
        },
      ],
    });

  activeSpaceSubscribers = activeSpaceSubscribers?.slice(0, 8);

  const allSpaceSubscribers = activeSpaceSubscribers
    ?.slice(0, 8)
    .concat(
      inactiveSpaceSubscribers?.slice(0, 8 - activeSpaceSubscribers.length) ||
        []
    );

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
    <PressableTransformation onPress={onPress} style={style}>
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
          <View
            style={{
              flexDirection: "row",
            }}
          >
            {(allSpaceSubscribers || []).map((spaceSubscriber) => {
              return <Avatar key={spaceSubscriber.id} size={32} />;
            })}
          </View>
          <Text style={{ color: template.colors.textLight }}>
            {activeSpaceSubscribers?.length} others online
          </Text>
        </View>
      </View>
    </PressableTransformation>
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
