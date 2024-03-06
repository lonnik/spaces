import { ComponentProps, FC, memo, useEffect, useState } from "react";
import { FlatList, ListRenderItem, View } from "react-native";
import { Message as TMessage, SpaceStackParamList, Uuid } from "../../../types";
import { StackNavigationProp } from "@react-navigation/stack";
import { Avatar } from "../../../components/Avatar";
import { Message } from "../../../modules/space/components/Message";
import { MessageInfo } from "../../../modules/space/components/MessageInfo";
import { PressableTransformation } from "../../../components/PressableTransformation";
import { MessageLevel } from "../types";
import { RouteProp, useNavigation } from "@react-navigation/native";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getMessage, getThreadWithMessages } from "../../../utils/queries";
import { NextPageLoadingIndicator } from "./NextPageLoadingIndicator";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LoadingScreen } from "../../../screens/Loading";
import { LastUpdatedContext } from "../../../components/context/LastUpdatedContext";

type ParentMessageListItem = {
  type: "parent";
  message?: TMessage;
};

type AnswerMessageListItem = {
  type: "answer";
  message: TMessage;
};

type LoadingIndicatorListItem = {
  type: "loading";
};

type ListItem =
  | ParentMessageListItem
  | AnswerMessageListItem
  | LoadingIndicatorListItem;

const pageSize = 6;

export const MessageList: FC<{
  spaceId: Uuid;
  level: MessageLevel;
  parentThreadId: Uuid;
  parentMessageId: Uuid;
  route: RouteProp<SpaceStackParamList, "Thread" | "Answer">;
  threadId?: Uuid;
}> = ({ spaceId, level, parentThreadId, parentMessageId, threadId, route }) => {
  const {
    data: threadData,
    isLoading: threadDataIsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    enabled: !!threadId,
    queryKey: [
      "spaces",
      spaceId,
      "threads",
      parentThreadId,
      "messages",
      parentMessageId,
      "threads",
      threadId,
      "recent",
    ],
    queryFn: ({ pageParam }) => {
      const offset = pageParam * pageSize;

      return getThreadWithMessages(
        spaceId,
        threadId!,
        "recent",
        pageSize,
        offset
      );
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage.messages.length < pageSize) {
        return undefined;
      }

      return lastPageParam + 1;
    },
  });

  const { data: parentMessageData, isLoading: parentMessageDataIsLoading } =
    useQuery({
      queryKey: [
        "spaces",
        spaceId,
        "threads",
        parentThreadId,
        "messages",
        parentMessageId,
      ],
      queryFn: async () => getMessage(spaceId, parentThreadId, parentMessageId),
    });

  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({
      queryKey: [
        "spaces",
        spaceId,
        "threads",
        parentThreadId,
        "messages",
        parentMessageId,
      ],
    });
    setRefreshing(false);
  };

  const navigation = useNavigation<StackNavigationProp<SpaceStackParamList>>();

  useEffect(() => {
    if (parentMessageData?.childThreadId && !threadId) {
      navigation.setParams({
        ...route.params,
        threadId: parentMessageData.childThreadId,
      });
    }
  }, [parentMessageData?.childThreadId]);

  const insets = useSafeAreaInsets();

  const renderItem: ListRenderItem<ListItem> = ({ item }) => {
    switch (item.type) {
      case "parent":
        return (
          <ParentMessageListItem messageData={item.message} spaceId={spaceId} />
        );

      case "answer":
        return (
          <AnswerMessageListItem
            messageData={item.message}
            spaceId={spaceId}
            level={level}
          />
        );
      default:
        return <LoadingScreen />;
    }
  };

  const isLoading = parentMessageDataIsLoading || threadDataIsLoading;

  const answerMessages =
    threadData?.pages
      .map((page) => {
        return page.messages.map((message) => {
          return { type: "answer", message } as AnswerMessageListItem;
        });
      })
      .flat() || [];

  const data = isLoading
    ? [{ type: "loading" } as LoadingIndicatorListItem]
    : [
        { type: "parent", message: parentMessageData } as ParentMessageListItem,
        ...answerMessages,
      ];

  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    if (refreshing) {
      setLastUpdated(new Date());
    }
  }, [refreshing]);

  return (
    <LastUpdatedContext.Provider value={lastUpdated}>
      <FlatList
        style={{ flex: 1 }}
        data={data}
        renderItem={renderItem}
        onRefresh={onRefresh}
        refreshing={refreshing}
        contentContainerStyle={{ paddingBottom: insets.bottom + 60, gap: 20 }}
        keyExtractor={(item) => {
          return item.type !== "answer" ? item.type : item.message.id;
        }}
        ListFooterComponent={
          <NextPageLoadingIndicator
            isLoading={isFetchingNextPage}
            hasNextPage={hasNextPage}
          />
        }
        onEndReached={() => {
          if (hasNextPage) {
            fetchNextPage();
          }
        }}
        alwaysBounceVertical={false}
      />
    </LastUpdatedContext.Provider>
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
        fontSize={15}
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
