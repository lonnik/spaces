import { FC } from "react";
import { View } from "react-native";
import { SpaceStackParamList } from "../../types";
import { Header } from "../../components/Header";
import { StackScreenProps } from "@react-navigation/stack";
import { template } from "../../styles/template";
import { Text } from "../../components/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "../../components/form/PrimaryButton";
import { MessageLevel } from "../../modules/space/types";
import { MessageList } from "../../modules/space/components/MessageList";
import { useSpaceColor } from "../../hooks/use_space_color";

export const MessageScreen: FC<
  StackScreenProps<SpaceStackParamList, "Thread" | "Answer"> & {
    level: MessageLevel;
  }
> = ({ route, level, navigation }) => {
  const { threadId, parentMessageId, parentThreadId, spaceId } = route.params;

  const insets = useSafeAreaInsets();

  const spaceColor = useSpaceColor();

  return (
    <View style={{ flex: 1 }}>
      <Header
        text={level === "thread" ? "Thread" : "Answers"}
        displayArrowBackButton
      />
      <PrimaryButton
        onPress={() =>
          navigation.navigate("Share", {
            parentThreadId: parentThreadId,
            parentMessageId: parentMessageId,
            threadId: threadId,
          })
        }
        color={spaceColor}
        style={{
          alignSelf: "center",
          position: "absolute",
          bottom: insets.bottom + template.paddings.md,
          zIndex: 1000,
        }}
      >
        <Text style={{ color: template.colors.white }}>
          {level === "thread" ? "Add something to thread" : "Answer"}
        </Text>
      </PrimaryButton>
      <View
        style={{
          flex: 1,
          paddingHorizontal: template.paddings.md,
          flexDirection: "column",
        }}
      >
        <MessageList
          level={level}
          route={route}
          spaceId={spaceId}
          parentMessageId={parentMessageId}
          parentThreadId={parentThreadId}
          threadId={threadId}
        />
      </View>
    </View>
  );
};
