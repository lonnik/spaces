import { StackScreenProps } from "@react-navigation/stack";
import { FC } from "react";
import { Button, View } from "react-native";
import { RootStackParamList } from "../types";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

export const ProfileScreen: FC<
  StackScreenProps<RootStackParamList, "Profile">
> = () => {
  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error("error :>>", error));
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="logout" onPress={handleSignOut} />
    </View>
  );
};
