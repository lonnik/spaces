import React, { FC } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { template } from "../../../styles/template";
import { Text } from "../../../components/Text";
import { Uuid } from "../../../types";
import { useQueries } from "@tanstack/react-query";
import { getSpaceSubscribers } from "../../../utils/queries";
import { AvatarRow } from "./AvatarRow";
import { PressableTransformation } from "../../../components/PressableTransformation";

export const SubscribersSection: FC<{
  spaceId: Uuid;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}> = ({ style, spaceId, onPress }) => {
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

  return (
    <PressableTransformation onPress={onPress}>
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
          backgroundColor: template.colors.grayLightBackground,
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
      </View>
    </PressableTransformation>
  );
};
