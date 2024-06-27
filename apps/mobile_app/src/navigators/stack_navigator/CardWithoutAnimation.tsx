import { FC, ReactNode } from "react";
import { View } from "react-native";
import { template } from "../../styles/template";

export const CardWithoutAnimation: FC<{
  children: ReactNode;
}> = ({ children }) => {
  return (
    <View
      style={{
        flex: 1,
        overflow: "hidden",
        backgroundColor: "#fff",
      }}
    >
      {children}
    </View>
  );
};
