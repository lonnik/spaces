import "react-native-gesture-handler";
import { View } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { FC } from "react";
import { TabsParamList } from "../types";
import { Header } from "../components/Header";
import { template } from "../styles/template";
import {
  ButtonListItem,
  EmptyStateListItem,
  HeadingListItem,
  ListItem,
  TSpaceListItem,
} from "../modules/my_spaces/types";
import {
  lastVisitedSpaces,
  subscribedSpaces,
} from "../modules/my_spaces/constants";
import { List } from "../modules/my_spaces/components/List";

export const MySpacesScreen: FC<
  BottomTabScreenProps<TabsParamList, "MySpaces">
> = ({ navigation }) => {
  const showSubscribedSpaces = subscribedSpaces.length > 0;
  const showLastVisitedSpaces =
    subscribedSpaces.length === 0 && lastVisitedSpaces.length > 0;

  const data: ListItem[] = [
    ...(showSubscribedSpaces && lastVisitedSpaces.length > 0
      ? [
          {
            type: "button",
            text: "Last Visited Spaces",
            onPress: () => navigation.navigate("LastVisitedSpaces" as any),
          } as ButtonListItem,
        ]
      : []),
    { type: "heading", heading: "Subscribed spaces" },
    ...(!showSubscribedSpaces
      ? [
          {
            type: "empty",
            message: "your subscribed spaces will show up here",
          } as EmptyStateListItem,
        ]
      : []),
    ...(showSubscribedSpaces
      ? subscribedSpaces.map<TSpaceListItem>((space) => ({
          type: "space",
          data: space.data,
          spaceType: "subscribed",
        }))
      : []),
    ...(showLastVisitedSpaces
      ? [{ type: "heading", heading: "Last visited spaces" } as HeadingListItem]
      : []),
    ...(showLastVisitedSpaces
      ? lastVisitedSpaces.map<TSpaceListItem>((space) => ({
          type: "space",
          data: space.data,
          spaceType: "lastVisited",
        }))
      : []),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header text="My Spaces" />
      <View
        style={{
          flex: 1,
          paddingHorizontal: template.paddings.md,
        }}
      >
        <List data={data} />
      </View>
    </View>
  );
};
