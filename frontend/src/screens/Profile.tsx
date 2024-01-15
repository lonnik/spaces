import { StackScreenProps } from "@react-navigation/stack";
import { FC, useContext } from "react";
import { Button, Text, View } from "react-native";
import { RootStackParamList } from "../types";
import { RootDispatchContext } from "../components/RootContext";

export const ProfileScreen: FC<
  StackScreenProps<RootStackParamList, "Profile">
> = () => {
  const dispatch = useContext(RootDispatchContext);

  const handleSignOut = () => {
    dispatch!({ type: "SIGN_OUT" });
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="logout" onPress={handleSignOut} />
    </View>
  );
};
