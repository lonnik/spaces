import { FC, memo } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import {
  type Message as TMessage,
  Uuid,
  SpaceStackParamList,
} from "../../../types";
import { useQuery } from "@tanstack/react-query";
import { getThreadWithMessages } from "../../../utils/queries";
import { Avatar } from "../../../components/Avatar";
import { Message } from "./Message";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MessageInfo } from "./MessageInfo";
import { PressableTransformation } from "../../../components/PressableTransformation";

const count = 1;
const offset = 0;

export const ThreadItem: FC<{
  spaceId: Uuid;
  message: TMessage;
  style?: StyleProp<ViewStyle>;
}> = memo(
  ({ spaceId, message, style }) => {
    const { data: answerThread } = useQuery({
      enabled: !!message.childThreadId,
      queryKey: [
        "spaces",
        spaceId,
        "threads",
        message.childThreadId,
        "popularity",
        count,
        offset,
      ],
      queryFn: async () => {
        return getThreadWithMessages(
          spaceId,
          message.childThreadId,
          "popularity",
          count,
          offset
        );
      },
    });

    if (answerThread) {
      message.childThreadMessagesCount = answerThread.messagesCount;
    }

    const firstAnswerData = answerThread?.messages?.[0];

    const firstAnswer = firstAnswerData ? (
      <View style={{ flex: 1, flexDirection: "row", gap: 5, marginTop: 10 }}>
        <Avatar size={22} />
        <PressableTransformation
          onPress={() => {
            navigation.navigate("Answer", {
              parentMessageId: firstAnswerData.id,
              parentThreadId: firstAnswerData.threadId,
              threadId: firstAnswerData.childThreadId,
              spaceId,
            });
          }}
        >
          <Message
            message={firstAnswerData}
            style={{ paddingVertical: 6, paddingHorizontal: 8, gap: 8 }}
            fontSize={15}
            spaceId={spaceId}
          />
        </PressableTransformation>
      </View>
    ) : null;

    const navigation =
      useNavigation<StackNavigationProp<SpaceStackParamList>>();

    return (
      <View style={[{ flex: 1 }, style]}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            marginBottom: 5,
          }}
        >
          <Avatar size={28} />
          <MessageInfo
            userId={message.senderId}
            createdAt={message.createdAt}
          />
        </View>
        <View>
          <PressableTransformation
            onPress={() => {
              navigation.navigate("Thread", {
                threadId: message.childThreadId,
                spaceId,
                parentMessageId: message.id,
                parentThreadId: message.threadId,
              });
            }}
          >
            <Message
              message={message}
              style={{ paddingHorizontal: 12, paddingVertical: 8, gap: 12 }}
              displayLikeButton
              displayAnswerButton
              spaceId={spaceId}
            />
          </PressableTransformation>
        </View>
        {firstAnswer}
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.childThreadId === nextProps.message.childThreadId
    );
  }
);
