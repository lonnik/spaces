import { FC } from "react";
import { View } from "react-native";
import { Uuid } from "../../types";
import { Header } from "../../components/Header";

export const ThreadScreen: FC<{ spaceId: Uuid }> = () => {
  return (
    <View style={{ flex: 1 }}>
      <Header text="Thread" />
    </View>
  );
};
