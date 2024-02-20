import { FC } from "react";
import { Pressable, View } from "react-native";
import { template } from "../styles/template";
import { Text } from "./Text";
import { CloseIcon } from "./icons/CloseIcon";
import { useCustomNavigation } from "./context/GoBackContext";

export const Header: FC<{ text: string; onClose?: () => void }> = ({
  text,
  onClose,
}) => {
  const navigation = useCustomNavigation();

  return (
    <View
      style={{
        height: template.height.header,
        paddingHorizontal: 20,
      }}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <View style={{ flex: 1 }} />
        <Text
          style={{
            color: template.colors.text,
            textAlign: "center",
            fontSize: 16,
            fontStyle: "normal",
            fontWeight: "600",
            letterSpacing: 0.32,
          }}
        >
          {text}
        </Text>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Pressable
            onPress={() => {
              if (onClose) {
                onClose();
              }

              navigation.goBack();
            }}
            hitSlop={15}
          >
            {({ pressed }) => {
              return <CloseIcon fill={pressed ? "#aaa" : "#ddd"} />;
            }}
          </Pressable>
        </View>
      </View>
    </View>
  );
};
