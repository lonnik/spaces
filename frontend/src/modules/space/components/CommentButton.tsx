import { FC } from "react";
import { View } from "react-native";
import { template } from "../../../styles/template";
import { Text } from "../../../components/Text";
import { Message, SpaceStackParamList } from "../../../types";
import { CommentIcon } from "../../../components/icons/CommentIcon";
import { PressableTransformation } from "../../../components/PressableTransformation";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

export const CommentButton: FC<{ messageData: Message }> = ({
  messageData,
}) => {
  const navigation = useNavigation<StackNavigationProp<SpaceStackParamList>>();

  return (
    <PressableTransformation
      onPress={() => {
        navigation.navigate("Share", {
          parentThreadId: messageData.threadId,
          parentMessageId: messageData.id,
          threadId: messageData.childThreadId,
        });
      }}
    >
      <View style={{ flexDirection: "row", gap: 3 }}>
        <CommentIcon
          style={{ width: 17, height: 17 }}
          stroke={template.colors.textLight}
          strokeWidth={70}
        />
        {messageData.childThreadMessagesCount ? (
          <Text
            style={{
              color: template.colors.text,
              fontWeight: "400",
              fontSize: 13,
            }}
          >
            {messageData.childThreadMessagesCount}
          </Text>
        ) : null}
      </View>
    </PressableTransformation>
  );
};
