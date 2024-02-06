import { FC, forwardRef } from "react";
import { Text as ReactText, TextProps } from "react-native";
import { template } from "../styles/template";

export const Text = forwardRef<ReactText, TextProps>(
  ({ style, children, ...props }, ref) => {
    return (
      <ReactText
        style={[
          { fontFamily: "Helvetica", color: template.colors.text },
          style,
        ]}
        {...props}
        ref={ref}
      >
        {children}
      </ReactText>
    );
  }
);
