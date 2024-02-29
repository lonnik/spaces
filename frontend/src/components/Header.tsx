import { FC, ReactNode } from "react";
import { Pressable, View } from "react-native";
import { template } from "../styles/template";
import { Text } from "./Text";
import { useCustomNavigation } from "../hooks/use_custom_navigation";
import { ArrowDownIcon } from "./icons/ArrowDownIcon";
import { ArrowBackButton } from "./icons/ArrowBackButton";

export const Header: FC<{
  text?: string;
  onClose?: () => void;
  displayArrowDownButton?: boolean;
  displayArrowBackButton?: boolean;
  centerElement?: ReactNode;
  rightElement?: ReactNode;
}> = ({
  text,
  onClose,
  displayArrowDownButton = false,
  displayArrowBackButton = false,
  centerElement,
  rightElement,
}) => {
  const navigation = useCustomNavigation();

  const handleOnPress = () => {
    if (onClose) {
      onClose();
    }

    navigation.goBack();
  };

  const centerElementView = centerElement || (
    <Text
      style={{
        color: template.colors.text,
        textAlign: "center",
        fontSize: 20,
        fontStyle: "normal",
        fontWeight: "600",
        letterSpacing: -0.4,
        maxWidth: "75%",
      }}
    >
      {text || ""}
    </Text>
  );

  const rightElementView = rightElement || null;

  const closeButton = displayArrowDownButton ? (
    <Button onPress={handleOnPress}>
      <ArrowDownIcon
        style={{ width: 24, height: 12 }}
        strokeWidth={12}
        stroke={template.colors.text}
      />
    </Button>
  ) : null;

  const arrowBackButton = displayArrowBackButton ? (
    <Button onPress={handleOnPress}>
      <ArrowBackButton
        style={{ width: 12, height: 24 }}
        strokeWidth={12}
        stroke={template.colors.text}
      />
    </Button>
  ) : null;

  return (
    <View
      style={{
        height: template.height.header,
        paddingHorizontal: template.paddings.md,
      }}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <View
          style={{
            flex: 1,
          }}
        >
          {closeButton}
          {arrowBackButton}
        </View>
        {centerElementView}
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          {rightElementView}
        </View>
      </View>
    </View>
  );
};

const Button: FC<{ children: ReactNode; onPress: () => void }> = ({
  children,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={{ alignSelf: "flex-start" }}
      hitSlop={20}
    >
      {children}
    </Pressable>
  );
};
