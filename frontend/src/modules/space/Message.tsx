import { FC, useState } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { template } from "../../styles/template";
import { Text } from "../../components/Text";
import { type Message as TMessage } from "../../types";
import { LikeButton } from "./LikeButton";

export const Message: FC<{
  message: TMessage;
  displayLikeButton?: boolean;
  displayAnswersCount?: boolean;
  style?: StyleProp<ViewStyle>;
  fontSize?: number;
}> = ({
  message,
  style,
  fontSize = 26,
  displayLikeButton = false,
  displayAnswersCount = false,
}) => {
  const [isLiked, setIsLiked] = useState(false);

  displayAnswersCount =
    displayAnswersCount && !!message.childThreadMessagesCount;

  return (
    <View
      style={[
        {
          backgroundColor: template.colors.grayLightBackground,
          borderRadius: template.borderRadius.md,
          flex: 1,
        },
        style,
      ]}
    >
      <Text style={{ fontSize }}>{message.content}</Text>
      {displayLikeButton || displayAnswersCount ? (
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          {displayLikeButton ? (
            <LikeButton
              likes={message.likesCount}
              onPress={() => {
                setTimeout(() => setIsLiked((oldValue) => !oldValue), 1000);
              }}
              isLiked={isLiked}
            />
          ) : null}
          {displayAnswersCount ? (
            <Text
              style={{ color: template.colors.textLight }}
            >{`${message.childThreadMessagesCount} answers`}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};
