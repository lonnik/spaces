import "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, View } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { FC } from "react";
import { TabsParamList } from "../types";

export const HereScreen: FC<BottomTabScreenProps<TabsParamList, "Home">> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ marginTop: insets.top }}>
      <Button
        title="Profile"
        onPress={() => navigation.navigate("Profile" as any)}
      />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Home!</Text>
      </View>
    </View>
  );
};
