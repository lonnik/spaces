import { FC } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

export const Avatar: FC<{ size?: number; style?: StyleProp<ViewStyle> }> = ({
  size = 32,
  style,
}) => {
  return (
    <View
      style={[
        {
          width: size,
          aspectRatio: 1,
          backgroundColor: "#ddd",
          borderRadius: 999,
          borderWidth: 1,
          borderColor: "#ccc",
        },
        style,
      ]}
    />
  );
};
