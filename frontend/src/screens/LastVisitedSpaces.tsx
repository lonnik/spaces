import "react-native-gesture-handler";
import { View } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { FC } from "react";
import { RootStackParamList } from "../types";
import { Header } from "../components/Header";
import { template } from "../styles/template";
import { TSpaceListItem } from "../modules/my_spaces/types";
import { lastVisitedSpaces } from "../modules/my_spaces/constants";
import { List } from "../modules/my_spaces/components/List";
import { Text } from "../components/Text";

export const LastVisitedSpacesScreen: FC<
  BottomTabScreenProps<RootStackParamList, "LastVisitedSpaces">
> = () => {
  const hasLastVisitedSpaces = lastVisitedSpaces.length > 0;

  const emptyStateMessageView = !hasLastVisitedSpaces ? (
    <View
      style={{
        flex: 1,
        maxHeight: 100,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: 16,
          color: "#aaa",
          maxWidth: 300,
          textAlign: "center",
        }}
      >
        {"You haven't visited any spaces yet"}
      </Text>
    </View>
  ) : null;

  const list = hasLastVisitedSpaces ? (
    <List
      data={lastVisitedSpaces.map<TSpaceListItem>((space) => ({
        type: "space",
        data: space.data,
        spaceType: "lastVisited",
      }))}
    />
  ) : null;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header text="Last Visited Spaces" displayArrowBackButton />
      <View
        style={{
          flex: 1,
          paddingHorizontal: template.paddings.md,
        }}
      >
        {emptyStateMessageView}
        {list}
      </View>
    </View>
  );
};
