import { FC } from "react";
import { View } from "react-native";

export const Header: FC = () => {
  return (
    <View
      style={{
        backgroundColor: "#f77",
        height: 60,
      }}
    >
      <View
        style={{
          width: 35,
          height: 5,
          borderRadius: 100,
          alignSelf: "center",
          marginTop: 8,
          backgroundColor: "#000",
          opacity: 0.5,
        }}
      />
    </View>
  );
};
