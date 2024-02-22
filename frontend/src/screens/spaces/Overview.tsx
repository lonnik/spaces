import { StackNavigationProp } from "@react-navigation/stack";
import { SpaceStackParamList } from "../../types";
import { FC } from "react";
import { FlatList, ListRenderItem, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getSpaceById } from "../../utils/queries";
import { LoadingScreen } from "../Loading";
import { Header } from "../../components/Header";
import { template } from "../../styles/template";
import { InfoSection } from "../../modules/space/InfoSection";
import { PrimaryButton } from "../../components/form/PrimaryButton";
import { Text } from "../../components/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Message, ThreadItem } from "../../modules/space/ThreadItem";
import { useNavigation } from "@react-navigation/native";

// TODO: animation from bottom on first render for share something button

export const SpaceOverviewScreen: FC<{ spaceId: string }> = ({ spaceId }) => {
  const insets = useSafeAreaInsets();

  const { data: space, isLoading } = useQuery({
    queryKey: ["spaces", spaceId],
    queryFn: () => getSpaceById(spaceId),
  });

  const navigation = useNavigation<StackNavigationProp<SpaceStackParamList>>();

  const data: (Message | undefined)[] = [
    undefined,
    // undefined,
    {
      id: "3",
      from: { avatar: "", id: "", username: "Thenick" },
      likes: 3,
      when: new Date(),
      content: { text: "Lorem Ipsum ..." },
      answers: [
        {
          id: "4",
          from: { avatar: "", id: "", username: "Thenick" },
          likes: 3,
          when: new Date(),
          content: {
            text: "Lorem ipsum dolor sit amet, consectetur. adipiscing elit. Vivamus inodio nec leo lacinia",
          },
        },
      ],
    },
    {
      id: "4",
      from: { avatar: "", id: "", username: "Thenick" },
      likes: 3,
      when: new Date(),
      content: { text: "Lorem Ipsum ..." },
      answers: [
        {
          id: "5",
          from: { avatar: "", id: "", username: "Thenick" },
          likes: 3,
          when: new Date(),
          content: {
            text: "Lorem ipsum dolor sit amet, consectetur. adipiscing elit. Vivamus inodio nec leo lacinia",
          },
        },
      ],
    },
    {
      id: "6",
      from: { avatar: "", id: "", username: "Thenick" },
      likes: 3,
      when: new Date(),
      content: { text: "Lorem Ipsum ..." },
      answers: [
        {
          id: "5",
          from: { avatar: "", id: "", username: "Thenick" },
          likes: 3,
          when: new Date(),
          content: {
            text: "Lorem ipsum dolor sit amet, consectetur. adipiscing elit. Vivamus inodio nec leo lacinia",
          },
        },
      ],
    },
  ];

  const renderItem: ListRenderItem<Message | undefined> = ({ index, item }) => {
    const isLast = index === data.length - 1;

    switch (index) {
      case 0:
        return (
          <InfoSection
            spaceMembers={Array.from({ length: 8 })}
            onPress={() => navigation.navigate("Info")}
            style={{ marginBottom: 20 }}
            spaceName={space?.name!}
            key={index}
          />
        );
      default:
        return (
          <>
            <ThreadItem
              message={item!}
              key={index}
              style={{ marginBottom: 26 }}
            />
            {isLast && <View style={{ height: insets.bottom + 50 }} />}
          </>
        );
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

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
