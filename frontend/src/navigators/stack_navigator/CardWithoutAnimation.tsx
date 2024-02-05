import { JSX, FC } from "react";
import { View } from "react-native";
import { template } from "../../styles/template";

export const CardWithoutAnimation: FC<{
  children: JSX.Element;
}> = ({ children }) => {
  return (
    <View
      style={{
        flex: 1,
        overflow: "hidden",
        borderTopLeftRadius: template.borderRadius.screen,
        borderTopRightRadius: template.borderRadius.screen,
        backgroundColor: "#fff",
      }}
    >
      {children}
    </View>
  );
};
