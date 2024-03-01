import React, { FC, useState } from "react";
import { Pressable, StyleProp, View, ViewStyle } from "react-native";
import { template } from "../../styles/template";
import { Text } from "../../components/Text";
import { useNotification } from "../../utils/notifications";
import { SpaceStackParamList, Uuid } from "../../types";
import { useQueries } from "@tanstack/react-query";
import { getSpaceSubscribers } from "../../utils/queries";
import { PressableTransformation } from "../../components/PressableTransformation";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { AvatarRow } from "./AvatarRow";

export const InfoSection: FC<{
  onPress: () => void;
  spaceId: Uuid;
  style?: StyleProp<ViewStyle>;
}> = ({ onPress, style, spaceId }) => {
  const [joined, setJoined] = useState(false);

  const navigation = useNavigation<StackNavigationProp<SpaceStackParamList>>();

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
    <>
      <View
        style={[
          {
            position: "absolute",
            top: 0,
            width: "100%",
            height: 10,
            backgroundColor: "white",
          },
          style,
        ]}
      />
      <View
        style={{
          flex: 1,
          padding: 10,
          backgroundColor: template.colors.purpleLightBackground,
          borderRadius: template.borderRadius.md,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <AvatarRow
            data={[
              { id: "1" },
              { id: "2" },
              { id: "3" },
              { id: "4" },
              { id: "5" },
              { id: "6" },
              { id: "7" },
              { id: "8" },
            ]}
          />
          <Text style={{ color: template.colors.textLight }}>
            {activeSpaceSubscribers?.length} others online
          </Text>
        </View>
        <View style={{ flexDirection: "row", marginTop: 15 }}>
          {[
            { text: "join", onPress: () => {} },
            { text: "invite", onPress: () => {} },
            {
              text: "info",
              onPress: () => {
                navigation.navigate("Info");
              },
            },
          ].map((data) => {
            return (
              <PressableTransformation key={data.text} onPress={data.onPress}>
                <View
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 6,
                    backgroundColor: template.colors.purple,
                    borderRadius: 999,
                    marginRight: 10,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "600",
                      fontSize: 16,
                      color: template.colors.white,
                    }}
                  >
                    {data.text}
                  </Text>
                </View>
              </PressableTransformation>
            );
          })}
        </View>
      </View>
    </>
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
