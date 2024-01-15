import { StackScreenProps } from "@react-navigation/stack";
import { FC } from "react";
import { Button, Text, View } from "react-native";
import { RootStackParamList } from "../types";

export const ProfileScreen: FC<
  StackScreenProps<RootStackParamList, "Profile">
> = ({ navigation }) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="back" onPress={() => navigation.goBack()} />
      <Text>Profile!</Text>
    </View>
  );
};
