import { FC, ReactNode } from "react";
import { Text } from "./Text";
import { StyleProp, TextStyle } from "react-native";
import { template } from "../styles/template";

export const Heading3: FC<{
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}> = ({ children, style }) => {
  return (
    <Text
      style={[{ fontWeight: template.fontWeight.bold, fontSize: 16 }, style]}
    >
      {children}
    </Text>
  );
};
