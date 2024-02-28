import { FC } from "react";
import { Pressable, View } from "react-native";
import { template } from "../styles/template";
import { Text } from "./Text";
import { CloseIcon } from "./icons/CloseIcon";
import { useCustomNavigation } from "../hooks/use_custom_navigation";

export const Header: FC<{
  text: string;
  onClose?: () => void;
  displayCloseButton?: boolean;
}> = ({ text, onClose, displayCloseButton = true }) => {
  const navigation = useCustomNavigation();

  return (
    <View
      style={{
        height: template.height.header,
        paddingHorizontal: template.paddings.screen,
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
          {displayCloseButton ? (
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
          ) : null}
        </View>
      </View>
    </View>
  );
};
