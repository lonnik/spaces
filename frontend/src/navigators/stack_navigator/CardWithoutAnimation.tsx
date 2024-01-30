import { JSX, FC } from "react";
import { View } from "react-native";

export const CardWithoutAnimation: FC<{
  children: JSX.Element;
}> = ({ children }) => {
  return (
    <View
      style={{
        flex: 1,
        overflow: "hidden",
        borderTopLeftRadius: 7,
        borderTopRightRadius: 7,
        backgroundColor: "#fff",
      }}
    >
      {children}
    </View>
  );
};
