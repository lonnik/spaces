import { StackNavigationProp } from "@react-navigation/stack";
import { Message, SpaceStackParamList } from "../../types";
import { FC, useState } from "react";
import { FlatList, ListRenderItem, View } from "react-native";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { getSpaceById, getToplevelThreads } from "../../utils/queries";
import { LoadingScreen } from "../Loading";
import { Header } from "../../components/Header";
import { template } from "../../styles/template";
import { InfoSection } from "../../modules/space/InfoSection";
import { PrimaryButton } from "../../components/form/PrimaryButton";
import { Text } from "../../components/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThreadItem } from "../../modules/space/ThreadItem";
import { useNavigation } from "@react-navigation/native";

type MessageListItem = {
  type: "message";
  message: Message;
};

type SpaceInfoListItem = {
  type: "info";
};

type ListItem = MessageListItem | SpaceInfoListItem;

// TODO: animation from bottom on first render for share something button

export const SpaceOverviewScreen: FC<{ spaceId: string }> = ({ spaceId }) => {
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

  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation<StackNavigationProp<SpaceStackParamList>>();

  const renderItem: ListRenderItem<ListItem> = ({ index, item }) => {
    if (item.type === "info") {
      return (
        <InfoSection
          key={index}
          spaceMembers={Array.from({ length: 8 })}
          onPress={() => navigation.navigate("Info")}
          style={{ marginBottom: 20 }}
          spaceName={space?.name!}
        />
      );
    }

    const isLast = index === topLevelThreads?.length;

    return (
      <>
        <ThreadItem
          key={index}
          spaceId={spaceId}
          message={item.message}
          style={{ marginBottom: 26 }}
        />
        {isLast && <View style={{ height: insets.bottom + 50 }} />}
      </>
    );
  };

  if (isLoadingSpace || isLoadingThreads) {
    return <LoadingScreen />;
  }

  const data = [
    { type: "info" } as SpaceInfoListItem,
    ...topLevelThreads!.map<MessageListItem>((thread) => ({
      type: "message",
      message: thread.firstMessage!,
    })),
  ];

  return (
    <View style={{ flex: 1 }}>
      <Header text={`${space?.name} 🏠`} />
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
        onRefresh={onRefresh}
        refreshing={refreshing}
        style={{
          flex: 1,
          paddingHorizontal: template.paddings.md,
          flexDirection: "column",
          paddingBottom: insets.bottom + 50,
        }}
        renderItem={renderItem}
      />
    </View>
  );
};
