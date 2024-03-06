import { ComponentProps, FC, memo } from "react";
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

type ParentMessageListItem = {
  type: "parent";
  message?: TMessage;
};

type AnswerMessageListItem = {
  type: "answer";
  message: TMessage;
};

type ListItem = ParentMessageListItem | AnswerMessageListItem;

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
  const renderItem: ListRenderItem<ListItem> = ({ item }) => {
    if (item.type === "parent") {
      return (
        <ParentMessageListItem messageData={item.message} spaceId={spaceId} />
      );
    }

    return (
      <AnswerMessageListItem
        messageData={item.message}
        spaceId={spaceId}
        level={level}
      />
    );
  };

  const answerMessages = (threadData?.messages || []).map((message) => {
    return { type: "answer", message } as AnswerMessageListItem;
  });

  const data = [
    { type: "parent", message: parentMessageData } as ParentMessageListItem,
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
      keyExtractor={(item) => {
        if (item.type === "parent") {
          return "parent";
        }

        return item.message.id;
      }}
    />
  );
};

const ParentMessageListItem: FC<{ messageData?: TMessage; spaceId: Uuid }> = ({
  messageData,
  spaceId,
}) => {
  if (!messageData) {
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
          createdAt={messageData.createdAt}
          userId={messageData.senderId}
          style={{ marginBottom: 5 }}
        />
      </View>
      <Message
        message={messageData}
        style={{ paddingHorizontal: 12, paddingVertical: 8, gap: 12 }}
        displayLikeButton
        displayAnswerButton
        spaceId={spaceId}
        fontSize={14}
      />
    </View>
  );
};

const AnswerMessageListItem: FC<{
  messageData: TMessage;
  spaceId: Uuid;
  level: MessageLevel;
}> = memo(
  ({ messageData, spaceId, level }) => {
    const navigation =
      useNavigation<
        StackNavigationProp<SpaceStackParamList, "Thread" | "Answer">
      >();

    const messageProps: ComponentProps<typeof Message> = {
      message: messageData,
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
            createdAt={messageData.createdAt}
            userId={messageData.senderId}
            style={{ marginBottom: 5 }}
          />
          {level === "thread" ? (
            <PressableTransformation
              onPress={() =>
                navigation.navigate("Answer", {
                  threadId: messageData.childThreadId,
                  parentMessageId: messageData.id,
                  parentThreadId: messageData.threadId,
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
  },
  (prevProps, nextProps) => {
    return (
      prevProps.level === nextProps.level &&
      prevProps.spaceId === nextProps.spaceId &&
      prevProps.messageData.id === nextProps.messageData.id &&
      prevProps.messageData.childThreadId ===
        nextProps.messageData.childThreadId &&
      prevProps.messageData.likesCount === nextProps.messageData.likesCount &&
      prevProps.messageData.childThreadMessagesCount ===
        nextProps.messageData.childThreadMessagesCount
    );
  }
);
