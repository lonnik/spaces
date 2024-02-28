import { ComponentProps, FC } from "react";
import { FlatList, ListRenderItem, View } from "react-native";
import { Message as TMessage, SpaceStackParamList } from "../../types";
import { Header } from "../../components/Header";
import { useQueries } from "@tanstack/react-query";
import { getMessage, getThreadWithMessages } from "../../utils/queries";
import { StackScreenProps } from "@react-navigation/stack";
import { template } from "../../styles/template";
import { Avatar } from "../../components/Avatar";
import { Text } from "../../components/Text";
import { Message } from "../../modules/space/Message";
import { MessageInfo } from "../../modules/space/MessageInfo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "../../components/form/PrimaryButton";
import { PressableTransformation } from "../../components/PressableTransformation";

type ParentMessage = {
  type: "parent";
  message: TMessage;
};

type AnswerMessage = {
  type: "answer";
  message: TMessage;
};

type ListItem = ParentMessage | AnswerMessage;
type Level = "thread" | "answer";

export const MessageScreen: FC<
  StackScreenProps<SpaceStackParamList, "Thread" | "Answer"> & {
    level: Level;
  }
> = ({ route, level, navigation }) => {
  const { threadId, parentMessageId, parentThreadId, spaceId } = route.params;

  const count = 10;
  const offset = 0;

  const [
    { data: threadData, refetch: refetchThread, isLoading: isLoadingThread },
    {
      data: parentMessageData,
      refetch: refetchParentMessage,
      isLoading: isLoadingParentMessage,
    },
  ] = useQueries({
    queries: [
      {
        enabled: !!threadId,
        queryKey: [
          "spaces",
          spaceId,
          "threads",
          threadId,
          "recent",
          count,
          offset,
        ],
        queryFn: async () => {
          return getThreadWithMessages(
            spaceId,
            threadId!,
            "recent",
            count,
            offset
          );
        },
      },
      {
        queryKey: [
          "spaces",
          spaceId,
          "threads",
          parentThreadId,
          "messages",
          parentMessageId,
        ],
        queryFn: async () =>
          getMessage(spaceId, parentThreadId, parentMessageId),
      },
    ],
  });

  const insets = useSafeAreaInsets();

  const renderItem: ListRenderItem<ListItem> = ({ index, item }) => {
    if (item.type === "parent") {
      return (
        <View style={{ marginBottom: 32 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Avatar size={32} style={{ marginRight: 7 }} />
            <MessageInfo
              userId={item.message.senderId}
              style={{ marginBottom: 5 }}
            />
          </View>
          <Message
            message={item.message}
            style={{ paddingHorizontal: 12, paddingVertical: 8, gap: 12 }}
            displayLikeButton={true}
            displayAnswersCount={true}
            spaceId={spaceId}
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
      displayAnswersCount: true,
      displayLikeButton: true,
    };

    return (
      <View style={{ flexDirection: "row", gap: 7 }}>
        <Avatar size={32} />
        <View style={{ flex: 1 }}>
          <MessageInfo
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

  if (!parentMessageData) {
    return null;
  }

  const answerMessages = (threadData?.messages || []).map((message) => {
    return { type: "answer", message } as AnswerMessage;
  });

  const data: ListItem[] = [
    { type: "parent", message: parentMessageData } as ParentMessage,
    ...answerMessages,
  ];

  const onRefresh = () => {
    refetchParentMessage();
    refetchThread();
  };

  return (
    <View style={{ flex: 1 }}>
      <Header
        text={level === "thread" ? "Thread" : "Answers"}
        displayArrowBackButton
      />
      <PrimaryButton
        onPress={() => navigation.navigate("Share")}
        style={{
          alignSelf: "center",
          position: "absolute",
          bottom: insets.bottom + template.paddings.md,
          zIndex: 1000,
        }}
      >
        <Text style={{ color: template.colors.white }}>
          {level === "thread" ? "Add something to thread" : "Answer"}
        </Text>
      </PrimaryButton>
      <View
        style={{
          flex: 1,
          paddingHorizontal: template.paddings.md,
          flexDirection: "column",
          paddingBottom: insets.bottom + 50,
        }}
      >
        <FlatList
          style={{ flex: 1 }}
          data={data}
          renderItem={renderItem}
          onRefresh={onRefresh}
          refreshing={isLoadingParentMessage || isLoadingParentMessage}
        />
      </View>
    </View>
  );
};
