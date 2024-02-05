import { Pressable } from "react-native";
import { FC, ReactNode } from "react";
import { template } from "../../styles/template";
import { Text } from "../../components/Text";

export const PrimaryButton: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Pressable
      style={{
        marginHorizontal: "auto",
        backgroundColor: template.colors.purple,
        paddingHorizontal: 29,
        paddingVertical: 13,
        borderRadius: 10,
      }}
    >
      <Text
        style={{
          textAlign: "center",
          color: "#FFF",
          fontSize: 16,
          fontWeight: "700",
          letterSpacing: 0.36,
          textTransform: "uppercase",
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
};
