import { FC, ReactNode } from "react";
import { Text } from "./Text";
import { StyleProp, TextStyle } from "react-native";

export const Heading3: FC<{
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}> = ({ children, style }) => {
  return (
    <Text style={[{ fontWeight: "600", fontSize: 16 }, style]}>{children}</Text>
  );
};
