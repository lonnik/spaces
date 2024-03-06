import { FC, useEffect } from "react";
import { View } from "react-native";
import { SpaceStackParamList } from "../../types";
import { Header } from "../../components/Header";
import { useQueries } from "@tanstack/react-query";
import { getMessage, getThreadWithMessages } from "../../utils/queries";
import { StackScreenProps } from "@react-navigation/stack";
import { template } from "../../styles/template";
import { Text } from "../../components/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "../../components/form/PrimaryButton";
import { MessageLevel } from "../../modules/space/types";
import { MessageList } from "../../modules/space/components/MessageList";

export const MessageScreen: FC<
  StackScreenProps<SpaceStackParamList, "Thread" | "Answer"> & {
    level: MessageLevel;
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

  useEffect(() => {
    if (parentMessageData?.childThreadId && !threadId) {
      navigation.setParams({
        ...route.params,
        threadId: parentMessageData.childThreadId,
      });
    }
  }, [parentMessageData?.childThreadId]);

  const insets = useSafeAreaInsets();

  if (!parentMessageData) {
    return null;
  }

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
        onPress={() =>
          navigation.navigate("Share", {
            parentThreadId: parentThreadId,
            parentMessageId: parentMessageId,
            threadId: threadId,
          })
        }
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
        <MessageList
          level={level}
          onRefresh={onRefresh}
          isRefreshing={isLoadingParentMessage || isLoadingThread}
          spaceId={spaceId}
          parentMessageData={parentMessageData}
          threadData={threadData}
        />
      </View>
    </View>
  );
};
