import { FC } from "react";
import { FlatList, ListRenderItem, View } from "react-native";
import { Header } from "../../components/Header";
import { Uuid } from "../../types";
import { Heading3 } from "../../components/headings";
import { Avatar } from "../../components/Avatar";
import { Text } from "../../components/Text";
import { template } from "../../styles/template";

type ListItem = HeadingListItem | SubscriberListItem;

type HeadingListItem = {
  type: "heading";
  headingText: string;
};

type SubscriberListItem = {
  type: "subscriber";
  name: string;
  avatarUrl: string;
  createdAt: string;
};

export const SpaceSubscribersScreen: FC<{ spaceId: Uuid }> = ({ spaceId }) => {
  const renderItem: ListRenderItem<ListItem> = ({ index, item }) => {
    if (item.type === "heading") {
      return (
        <Heading3
          style={{
            marginBottom: 5,
            paddingVertical: 5,
            backgroundColor: template.colors.white,
          }}
        >
          {item.headingText}
        </Heading3>
      );
    }

    return (
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          alignItems: "center",
          marginBottom: 15,
        }}
      >
        <Avatar />
        <View>
          <Text style={{ fontWeight: "600" }}>{item.name}</Text>
          <Text style={{ color: template.colors.textLight }}>
            {item.createdAt}
          </Text>
        </View>
      </View>
    );
  };

  const data: ListItem[] = [
    { type: "heading", headingText: "Online Subscribers" },
    {
      type: "subscriber",
      name: "nikoko",
      avatarUrl: "",
      createdAt: "joined 2 days",
    },
    { type: "heading", headingText: "All Subscribers" },
    {
      type: "subscriber",
      name: "nikoko",
      avatarUrl: "",
      createdAt: "joined 2 days",
    },
    {
      type: "subscriber",
      name: "nikoko",
      avatarUrl: "",
      createdAt: "joined 2 days",
    },
    {
      type: "subscriber",
      name: "nikoko",
      avatarUrl: "",
      createdAt: "joined 2 days",
    },
    {
      type: "subscriber",
      name: "nikoko",
      avatarUrl: "",
      createdAt: "joined 2 days",
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header text="Subscribers" displayArrowBackButton />
      <FlatList
        renderItem={renderItem}
        data={data}
        style={{ paddingHorizontal: template.paddings.md }}
        contentContainerStyle={{ paddingBottom: 50 }}
        stickyHeaderIndices={[0, 2]}
        alwaysBounceVertical={false}
      />
    </View>
  );
};
