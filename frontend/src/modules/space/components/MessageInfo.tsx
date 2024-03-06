import { PointIcon } from "../../../components/icons/PointIcon";
import { template } from "../../../styles/template";
import { Text } from "../../../components/Text";
import { FC, useMemo } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Uuid } from "../../../types";
import { getUser } from "../../../utils/queries";
import { getTimeAgoText } from "../../../utils/time";
import { useLastUpdated } from "../../../hooks/use_last_updated";

export const MessageInfo: FC<{
  createdAt: string;
  userId: Uuid;
  style?: StyleProp<ViewStyle>;
}> = ({ userId, style, createdAt }) => {
  const lastUpdated = useLastUpdated();

  const { data } = useQuery({
    queryKey: ["users", userId],
    queryFn: async () => {
      return getUser(userId);
    },
  });

  const timeAgo = useMemo(() => {
    const nowDate = lastUpdated || new Date();

    return getTimeAgoText(new Date(createdAt), nowDate);
  }, [createdAt, lastUpdated]);

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
      <Text style={{ color: template.colors.textLight }}>{timeAgo}</Text>
    </View>
  );
};
