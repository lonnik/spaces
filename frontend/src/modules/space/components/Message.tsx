import { FC, useMemo, useState } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { template } from "../../../styles/template";
import { Text } from "../../../components/Text";
import { Uuid, type Message as TMessage } from "../../../types";
import { useMutation } from "@tanstack/react-query";
import { createMessageLike } from "../../../utils/queries";
import { LikeButton2 } from "./LikeButton2";

// TODO:
// prop should exist that says if the message is liked by the user
// mutation should also be able to unlike a message
// optimistic update: local state (numberLikes, messageIsLikedByUser) should be updated before the mutation is done
// this state should live in Like component, but that state should be overridden by the server state

export const Message: FC<{
  message: TMessage;
  spaceId: Uuid;
  displayLikeButton?: boolean;
  displayAnswersCount?: boolean;
  style?: StyleProp<ViewStyle>;
  fontSize?: number;
}> = ({
  message,
  spaceId,
  style,
  fontSize,
  displayLikeButton = false,
  displayAnswersCount = false,
}) => {
  // TODO: this state variable temporarily replaces the server state and will not be needed when the server state is implemented
  const [isLiked, setIsLiked] = useState(false);

  const { mutate: createNewMessageLike } = useMutation({
    mutationKey: ["likeMessage", message.id],
    mutationFn: async () =>
      createMessageLike(spaceId, message.threadId, message.id),
    onSuccess: () => {
      setIsLiked(true);
    },
  });

  const onLikeButtonPress = () => {
    createNewMessageLike();
  };

  fontSize = useMemo(() => {
    return fontSize || calculateFontSize(message.content);
  }, [message.content, fontSize]);

  displayAnswersCount =
    displayAnswersCount && !!message.childThreadMessagesCount;

  const likeButton = displayLikeButton ? (
    <View style={{ minWidth: 55 }}>
      <LikeButton2
        likes={message.likesCount}
        onPress={onLikeButtonPress}
        isLikedByUser={isLiked}
      />
    </View>
  ) : null;

  const answersCount = displayAnswersCount ? (
    <Text
      style={{ color: template.colors.textLight }}
    >{`${message.childThreadMessagesCount} answers`}</Text>
  ) : null;

  return (
    <View
      style={[
        {
          backgroundColor: template.colors.grayLightBackground,
          borderRadius: template.borderRadius.md,
        },
        style,
      ]}
    >
      <Text style={{ fontSize }}>{message.content}</Text>
      {likeButton || answersCount ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          {likeButton}
          {answersCount}
        </View>
      ) : null}
    </View>
  );
};

const calculateFontSize = (text: string, min = 14, max = 26) => {
  const lines = calculateLineCount(text);

  const fontSize = max - ((max - min) / 3) * (lines - 1);

  return Math.max(fontSize, min);
};

const calculateLineCount = (text: string) => {
  return text.split("\n").reduce((acc, line) => {
    return acc + Math.max(Math.ceil(line.length / 30), 1);
  }, 0);
};
