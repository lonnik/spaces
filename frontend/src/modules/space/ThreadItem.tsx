import { FC } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { template } from "../../styles/template";
import { Text } from "../../components/Text";
import { PointIcon } from "../../components/icons/PointIcon";
import { type Message as TMessage, Uuid } from "../../types";
import { useQueries } from "@tanstack/react-query";
import { getThreadWithMessages, getUser } from "../../utils/queries";
import { Avatar } from "../../components/Avatar";
import { Message } from "./Message";

// TODO:
// display date function
// text size function

export const ThreadItem: FC<{
  spaceId: Uuid;
  message: TMessage;
  style?: StyleProp<ViewStyle>;
}> = ({ spaceId, message, style }) => {
  const [
    { data: userData, isLoading: isLoadingUser },
    { data: answerThread, isLoading: isLoadingAnswerThread },
  ] = useQueries({
    queries: [
      {
        queryKey: ["spaces", spaceId, "users", message.senderId],
        queryFn: async () => {
          return getUser(message.senderId);
        },
      },
      {
        enabled: message.childThreadId.length > 0,
        queryKey: [
          "spaces",
          spaceId,
          "threads",
          message.childThreadId,
          "popularity",
        ],
        queryFn: async () => {
          return getThreadWithMessages(
            spaceId,
            message.childThreadId,
            "popularity",
            1,
            0
          );
        },
      },
    ],
  });

  if (answerThread) {
    message.childThreadMessagesCount = answerThread.messagesCount;
  }

  const firstAnswer = answerThread?.messages?.[0];

  return (
    <View style={[{ flex: 1 }, style]}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 5,
        }}
      >
        <Avatar size={32} style={{ marginRight: 7 }} />
        <Text style={{ color: template.colors.text, fontWeight: "bold" }}>
          {userData?.username || ""}
        </Text>
        <PointIcon
          style={{ marginHorizontal: 10 }}
          size={4}
          fill={template.colors.textLight}
        />
        <Text style={{ color: template.colors.textLight }}>2h</Text>
      </View>
      <View style={{ marginBottom: 10 }}>
        <Message
          message={message}
          style={{ paddingHorizontal: 12, paddingVertical: 8, gap: 12 }}
          displayLikeButton={true}
          displayAnswersCount={true}
        />
      </View>
      {firstAnswer ? (
        <View style={{ flex: 1, flexDirection: "row", gap: 5 }}>
          <Avatar size={22} />
          <Message
            message={firstAnswer}
            style={{ paddingVertical: 6, paddingHorizontal: 8, gap: 8 }}
            fontSize={14}
          />
        </View>
      ) : null}
    </View>
  );
};
