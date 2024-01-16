import "react-native-gesture-handler";
import { Button, Text, View } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { FC } from "react";
import { TabsParamList } from "../types";

export const MySpacesScreen: FC<
  BottomTabScreenProps<TabsParamList, "MySpaces">
> = ({ navigation }) => {
  return (
    <View>
      <Button
        title="Profile"
        onPress={() => navigation.navigate("Profile" as any)}
      />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>MySpaces</Text>
      </View>
    </View>
  );
};
