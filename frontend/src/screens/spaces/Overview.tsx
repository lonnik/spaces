import { StackNavigationProp } from "@react-navigation/stack";
import { Message, SpaceStackParamList, Uuid } from "../../types";
import { FC, useEffect, useRef, useState } from "react";
import { FlatList, ListRenderItem, View } from "react-native";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import {
  createSpaceSubscriber,
  getSpaceById,
  getToplevelThreads,
} from "../../utils/queries";
import { LoadingScreen } from "../Loading";
import { Header } from "../../components/Header";
import { template } from "../../styles/template";
import { SubscribersSection } from "../../modules/space/components/SubscribersSection";
import { PrimaryButton } from "../../components/form/PrimaryButton";
import { Text } from "../../components/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThreadItem } from "../../modules/space/components/ThreadItem";
import { useNavigation } from "@react-navigation/native";
import { getApiUrl } from "../../utils/get_api_url";
import { ButtonsSection } from "../../modules/space/components/ButtonsSection";

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
  text: string;
};

type ListItem =
  | MessageListItem
  | SubscribersListItem
  | ButtonsListItem
  | HeadingListItem;

// TODO: animation from bottom on first render for share something button

export const SpaceOverviewScreen: FC<{ spaceId: Uuid }> = ({ spaceId }) => {
  const insets = useSafeAreaInsets();

  const [
    { data: space, isLoading: isLoadingSpace },
    { data: topLevelThreads, isLoading: isLoadingThreads },
  ] = useQueries({
    queries: [
      {
        queryKey: ["spaces", spaceId],
        queryFn: () => getSpaceById(spaceId),
      },
      {
        queryKey: ["spaces", spaceId, "toplevel-threads"],
        queryFn: () => getToplevelThreads(spaceId),
      },
    ],
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.refetchQueries({ queryKey: ["spaces", spaceId] });
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

  const { mutate: createNewSpaceSubscriber } = useMutation({
    mutationKey: ["createSpaceSubscriber"],
    mutationFn: async () => {
      return createSpaceSubscriber(spaceId);
    },
  });

  useEffect(() => {
    createNewSpaceSubscriber();
  }, []);

  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);

  const renderItem: ListRenderItem<ListItem> = ({ index, item }) => {
    switch (item.type) {
      case "subscribers": {
        return (
          <SubscribersSection
            key={index}
            onPress={() => navigation.navigate("Subscribers")}
            spaceId={spaceId}
          />
        );
      }

      case "buttons": {
        return <ButtonsSection />;
      }

      case "heading": {
        return (
          <View style={{ marginTop: 10 }}>
            <Text
              key={index}
              style={{
                fontSize: 28,
                fontWeight: "600",
              }}
            >
              {item.text}
            </Text>
          </View>
        );
      }

      default: {
        return (
          <ThreadItem
            key={index}
            spaceId={spaceId}
            message={item.message}
            style={{ marginBottom: 10 }}
          />
        );
      }
    }
  };

  if (isLoadingSpace || isLoadingThreads) {
    return <LoadingScreen />;
  }

  const data = [
    { type: "subscribers" } as SubscribersListItem,
    { type: "buttons" } as ButtonsListItem,
    { type: "heading", text: "Threads" } as HeadingListItem,
    ...topLevelThreads!.map<MessageListItem>((thread) => ({
      type: "message",
      message: thread.firstMessage!,
    })),
  ];

  return (
    <View style={{ flex: 1 }}>
      <Header text={`${space?.name} 🏠`} displayArrowDownButton />
      <View style={{ flex: 1 }}>
        <PrimaryButton
          onPress={() => navigation.navigate("Share")}
          style={{
            alignSelf: "center",
            position: "absolute",
            bottom: insets.bottom + template.paddings.md,
            zIndex: 1000,
          }}
        >
          <Text style={{ color: template.colors.white }}>Share something</Text>
        </PrimaryButton>
        <FlatList
          data={data}
          renderItem={renderItem}
          onRefresh={onRefresh}
          stickyHeaderIndices={[1]}
          refreshing={refreshing}
          alwaysBounceVertical={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 60, gap: 10 }}
          style={{
            flex: 1,
            paddingHorizontal: template.paddings.md,
          }}
        />
      </View>
    </View>
  );
};
