import { PointIcon } from "../../../components/icons/PointIcon";
import { template } from "../../../styles/template";
import { Avatar } from "../../../components/Avatar";
import { Text } from "../../../components/Text";
import { FC } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Uuid } from "../../../types";
import { getUser } from "../../../utils/queries";

export const MessageInfo: FC<{
  userId: Uuid;
  style?: StyleProp<ViewStyle>;
}> = ({ userId, style }) => {
  const { data } = useQuery({
    queryKey: ["users", userId],
    queryFn: async () => {
      return getUser(userId);
    },
  });

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
        },
        style,
      ]}
    >
      <Text style={{ color: template.colors.text, fontWeight: "bold" }}>
        {data?.username || ""}
      </Text>
      <PointIcon
        style={{ marginHorizontal: 10 }}
        size={4}
        fill={template.colors.textLight}
      />
      <Text style={{ color: template.colors.textLight }}>2h</Text>
    </View>
  );
};
