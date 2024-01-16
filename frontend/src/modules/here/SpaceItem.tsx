import "react-native-gesture-handler";
import { Text, View, TouchableOpacity } from "react-native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { FC } from "react";
import { Space, TabsParamList } from "../../types";

export const SpaceItem: FC<{
  data: Space;
  navigation: BottomTabNavigationProp<TabsParamList, "Here", undefined>;
}> = ({ data, navigation }) => {
  return (
    <View
      style={{
        width: "33.33333%",
        padding: 5,
        aspectRatio: 1,
      }}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: `#${data.themeColorHexaCode}`,
          borderRadius: 7,
          marginVertical: 0,
          paddingHorizontal: 0,
        }}
        onPress={() => {
          navigation.navigate("Space" as any, { spaceId: data.id });
        }}
      >
        <Text>{JSON.stringify(data)}</Text>
      </TouchableOpacity>
    </View>
  );
};
