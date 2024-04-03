import { FC, ReactNode } from "react";
import { Text } from "../Text";
import { template } from "../../styles/template";
import { StyleProp, TextStyle } from "react-native";

export const Label: FC<{
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}> = ({ children, style }) => {
  return (
    <Text
      style={[
        {
          fontSize: 16,
          fontWeight: "bold",
          color: template.colors.text,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};
