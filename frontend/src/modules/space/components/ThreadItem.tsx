import { FC } from "react";
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

// TODO:
// display date function
// text size function

const count = 1;
const offset = 0;

export const ThreadItem: FC<{
  spaceId: Uuid;
  message: TMessage;
  style?: StyleProp<ViewStyle>;
}> = ({ spaceId, message, style }) => {
  const { data: answerThread, isLoading: isLoadingAnswerThread } = useQuery({
    enabled: message.childThreadId.length > 0,
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

  const firstAnswer = answerThread?.messages?.[0];

  const navigation = useNavigation<StackNavigationProp<SpaceStackParamList>>();

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
        <MessageInfo userId={message.senderId} />
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
            displayLikeButton={true}
            displayAnswersCount={true}
            spaceId={spaceId}
          />
        </PressableTransformation>
      </View>
      {firstAnswer ? (
        <View style={{ flex: 1, flexDirection: "row", gap: 5, marginTop: 10 }}>
          <Avatar size={22} />
          <PressableTransformation
            onPress={() => {
              navigation.navigate("Answer", {
                parentMessageId: firstAnswer.id,
                parentThreadId: firstAnswer.threadId,
                threadId: firstAnswer.childThreadId,
                spaceId,
              });
            }}
          >
            <Message
              message={firstAnswer}
              style={{ paddingVertical: 6, paddingHorizontal: 8, gap: 8 }}
              fontSize={14}
              spaceId={spaceId}
            />
          </PressableTransformation>
        </View>
      ) : null}
    </View>
  );
};
