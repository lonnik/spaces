import { FC } from "react";
import { Text as ReactText, TextProps } from "react-native";
import { template } from "../styles/template";

export const Text: FC<TextProps> = ({ style, children, ...props }) => {
  return (
    <ReactText
      style={[{ fontFamily: "Helvetica", color: template.colors.text }, style]}
      {...props}
    >
      {children}
    </ReactText>
  );
};
