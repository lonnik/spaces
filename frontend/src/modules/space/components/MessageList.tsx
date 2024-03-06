import { ComponentProps, FC } from "react";
import { FlatList, ListRenderItem, View } from "react-native";
import {
  Message as TMessage,
  SpaceStackParamList,
  Uuid,
  Thread,
} from "../../../types";
import { StackNavigationProp } from "@react-navigation/stack";
import { Avatar } from "../../../components/Avatar";
import { Message } from "../../../modules/space/components/Message";
import { MessageInfo } from "../../../modules/space/components/MessageInfo";
import { PressableTransformation } from "../../../components/PressableTransformation";
import { MessageLevel } from "../types";
import { useNavigation } from "@react-navigation/native";

type ParentMessage = {
  type: "parent";
  message?: TMessage;
};

type AnswerMessage = {
  type: "answer";
  message: TMessage;
};

type ListItem = ParentMessage | AnswerMessage;

export const MessageList: FC<{
  spaceId: Uuid;
  level: MessageLevel;
  onRefresh: () => void;
  isRefreshing: boolean;
  threadData?: Thread;
  parentMessageData?: TMessage;
}> = ({
  spaceId,
  level,
  onRefresh,
  isRefreshing,
  threadData,
  parentMessageData,
}) => {
  const navigation =
    useNavigation<
      StackNavigationProp<SpaceStackParamList, "Thread" | "Answer">
    >();

  const renderItem: ListRenderItem<ListItem> = ({ item }) => {
    if (item.type === "parent") {
      if (!item.message) {
        return null;
      }

      return (
        <View style={{ marginBottom: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Avatar style={{ marginRight: 7 }} />
            <MessageInfo
              createdAt={item.message.createdAt}
              userId={item.message.senderId}
              style={{ marginBottom: 5 }}
            />
          </View>
          <Message
            message={item.message}
            style={{ paddingHorizontal: 12, paddingVertical: 8, gap: 12 }}
            displayLikeButton
            displayAnswerButton
            spaceId={spaceId}
            fontSize={14}
          />
        </View>
      );
    }

    const messageProps: ComponentProps<typeof Message> = {
      message: item.message,
      style: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        gap: 8,
        marginTop: 5,
      },
      fontSize: 14,
      spaceId,
      displayAnswerButton: level === "thread",
      displayLikeButton: true,
    };

    return (
      <View style={{ flexDirection: "row", gap: 7 }}>
        <Avatar />
        <View style={{ flex: 1 }}>
          <MessageInfo
            createdAt={item.message.createdAt}
            userId={item.message.senderId}
            style={{ marginBottom: 5 }}
          />
          {level === "thread" ? (
            <PressableTransformation
              onPress={() =>
                navigation.navigate("Answer", {
                  threadId: item.message.childThreadId,
                  parentMessageId: item.message.id,
                  parentThreadId: item.message.threadId,
                  spaceId,
                })
              }
            >
              <Message {...messageProps} />
            </PressableTransformation>
          ) : (
            <Message {...messageProps} />
          )}
        </View>
      </View>
    );
  };

  const answerMessages = (threadData?.messages || []).map((message) => {
    return { type: "answer", message } as AnswerMessage;
  });

  const data: ListItem[] = [
    { type: "parent", message: parentMessageData } as ParentMessage,
    ...answerMessages,
  ];

  return (
    <FlatList
      style={{ flex: 1 }}
      data={data}
      renderItem={renderItem}
      onRefresh={onRefresh}
      refreshing={isRefreshing}
      contentContainerStyle={{ gap: 20 }}
    />
  );
};
