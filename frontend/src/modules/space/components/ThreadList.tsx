import { StackNavigationProp } from "@react-navigation/stack";
import {
  Message,
  SpaceStackParamList,
  TopLevelThread,
  Uuid,
} from "../../../types";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, ListRenderItem, View } from "react-native";
import { useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { getToplevelThreads } from "../../../utils/queries";
import { LoadingScreen } from "../../../screens/Loading";
import { template } from "../../../styles/template";
import { SubscribersSection } from "../../../modules/space/components/SubscribersSection";
import { Text } from "../../../components/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThreadItem } from "../../../modules/space/components/ThreadItem";
import { useNavigation } from "@react-navigation/native";
import { getApiUrl } from "../../../utils/get_api_url";
import { ButtonsSection } from "../../../modules/space/components/ButtonsSection";
import { NextPageLoadingIndicator } from "./NextPageLoadingIndicator";

type MessageListItem = {
  type: "message";
  message: Message;
};

type SubscribersListItem = {
  type: "subscribers";
};

type ButtonsListItem = {
  type: "buttons";
};

type HeadingListItem = {
  type: "heading";
};

type LoadingIndicatorListItem = {
  type: "loading";
};

type ListItem =
  | MessageListItem
  | SubscribersListItem
  | ButtonsListItem
  | HeadingListItem
  | LoadingIndicatorListItem;

const pageSize = 6;

export const ThreadList: FC<{ spaceId: Uuid }> = ({ spaceId }) => {
  const insets = useSafeAreaInsets();

  // TODO: getToplevelThreads query should return data point that indicates if there are more pages (fe.: cursor or total count), then I can render next FetchingNextPageIndicatorListItem without page jumping
  const {
    data: topLevelThreads,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["spaces", spaceId, "toplevel-threads"],
    queryFn: ({ pageParam }) => {
      const offset = pageParam * pageSize;

      return getToplevelThreads(spaceId, offset, pageSize);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage.length < pageSize) {
        return undefined;
      }

      return lastPageParam + 1;
    },
  });

  const queryClient = useQueryClient();

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: only refetch first page
    await queryClient.invalidateQueries({
      queryKey: ["spaces", spaceId],
    });
    setRefreshing(false);
  };

  const navigation = useNavigation<StackNavigationProp<SpaceStackParamList>>();

  // TODO:
  // figure out how to send auth token to backend for ws connection
  // fix navigator so useFocusEffect or onFocus listener works
  const websocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectSocket = () => {
      const websocketConnectionIsAlreadyInUse =
        websocketRef.current?.readyState === WebSocket.OPEN ||
        websocketRef.current?.readyState === WebSocket.CONNECTING;

      const baseUrl = getApiUrl().replace("https", "ws").replace("http", "ws");
      const websocketUrl = `${baseUrl}/spaces/${spaceId}/updates/ws`;
      websocketRef.current = new WebSocket(websocketUrl);

      websocketRef.current.onopen = () => {};

      websocketRef.current.onmessage = (event) => {};

      websocketRef.current.onclose = () => {};

      websocketRef.current.onerror = (error) => {};
    };

    connectSocket();

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  const [refreshing, setRefreshing] = useState(false);

  const renderItem: ListRenderItem<ListItem> = useCallback(
    ({ item }) => {
      switch (item.type) {
        case "subscribers": {
          return (
            <SubscribersSection
              onPress={() => navigation.navigate("Subscribers")}
              spaceId={spaceId}
            />
          );
        }
        case "buttons": {
          return <ButtonsSection />;
        }
        case "heading": {
          return <HeadingListItem text="Threads" />;
        }
        case "message": {
          return (
            <ThreadItem
              spaceId={spaceId}
              message={item.message}
              style={{ marginBottom: 10 }}
            />
          );
        }
        default:
          return <LoadingScreen />;
      }
    },
    [spaceId, navigation]
  );

  const data = useMemo(() => {
    const topLevelThreadsData = (
      topLevelThreads?.pages?.flat() || ([] as TopLevelThread[])
    ).map<MessageListItem>((thread) => ({
      type: "message",
      message: thread.firstMessage,
    }));

    return [
      { type: "subscribers" } as SubscribersListItem,
      { type: "buttons" } as ButtonsListItem,
      { type: "heading", text: "Threads" } as HeadingListItem,
      ...(isLoading
        ? [{ type: "loading" } as LoadingIndicatorListItem]
        : topLevelThreadsData),
    ];
  }, [topLevelThreads, isFetchingNextPage, isLoading]);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      onRefresh={onRefresh}
      stickyHeaderIndices={[1]}
      keyExtractor={(item) => {
        if (item.type === "message") {
          return item.message.id;
        }

        return item.type;
      }}
      ListFooterComponent={
        <NextPageLoadingIndicator
          isLoading={isFetchingNextPage}
          hasNextPage={hasNextPage}
        />
      }
      refreshing={refreshing}
      onEndReached={() => {
        if (hasNextPage) {
          fetchNextPage();
        }
      }}
      alwaysBounceVertical={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 60, gap: 10 }}
      style={{
        flex: 1,
        paddingHorizontal: template.paddings.md,
      }}
    />
  );
};

const HeadingListItem = ({ text }: { text: string }) => {
  return (
    <View style={{ marginTop: 10 }}>
      <Text
        style={{
          fontSize: 28,
          fontWeight: "600",
          marginBottom: 5,
        }}
      >
        {text}
      </Text>
    </View>
  );
};
