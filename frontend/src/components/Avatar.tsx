import { FC } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

export const Avatar: FC<{ size: number; style?: StyleProp<ViewStyle> }> = ({
  size,
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
        },
        style,
      ]}
    />
  );
};
