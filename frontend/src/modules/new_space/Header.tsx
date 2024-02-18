import { FC } from "react";
import { Pressable, View } from "react-native";
import { template } from "../../styles/template";
import { Text } from "../../components/Text";
import { CloseIcon } from "../../components/icons/CloseIcon";
import { useCustomNavigation } from "../../components/context/GoBackContext";

export const Header: FC = () => {
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
          New Space
        </Text>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Pressable onPress={navigation.goBack} hitSlop={15}>
            {({ pressed }) => {
              return <CloseIcon fill={pressed ? "#aaa" : "#ddd"} />;
            }}
          </Pressable>
        </View>
      </View>
    </View>
  );
};
