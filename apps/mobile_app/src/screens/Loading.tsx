import { FC } from "react";
import { ActivityIndicator, View } from "react-native";

export const LoadingScreen: FC = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator />
    </View>
  );
};
