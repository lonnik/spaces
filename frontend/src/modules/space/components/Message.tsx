import { FC, useMemo, useState } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { template } from "../../../styles/template";
import { Text } from "../../../components/Text";
import {
  Uuid,
  type Message as TMessage,
  SpaceStackParamList,
} from "../../../types";
import { useMutation } from "@tanstack/react-query";
import { createMessageLike } from "../../../utils/queries";
import { LikeButton } from "./LikeButton";
import { CommentIcon } from "../../../components/icons/CommentIcon";
import { PressableTransformation } from "../../../components/PressableTransformation";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

// TODO:
// prop should exist that says if the message is liked by the user
// mutation should also be able to unlike a message
// optimistic update: local state (numberLikes, messageIsLikedByUser) should be updated before the mutation is done
// this state should live in Like component, but that state should be overridden by the server state

export const Message: FC<{
  message: TMessage;
  spaceId: Uuid;
  displayLikeButton?: boolean;
  displayAnswerButton?: boolean;
  style?: StyleProp<ViewStyle>;
  fontSize?: number;
}> = ({
  message,
  spaceId,
  style,
  fontSize,
  displayLikeButton = false,
  displayAnswerButton = false,
}) => {
  // TODO: this state variable temporarily replaces the server state and will not be needed when the server state is implemented
  const [isLiked, setIsLiked] = useState(false);

  const navigation = useNavigation<StackNavigationProp<SpaceStackParamList>>();

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

  const likeButton = displayLikeButton ? (
    <View>
      <LikeButton
        likes={message.likesCount}
        onPress={onLikeButtonPress}
        isLikedByUser={isLiked}
      />
    </View>
  ) : null;

  const answerButton = displayAnswerButton ? (
    <PressableTransformation
      onPress={() => {
        navigation.navigate("Share", {
          parentThreadId: message.threadId,
          parentMessageId: message.id,
          threadId: message.childThreadId,
        });
      }}
    >
      <View style={{ flexDirection: "row", gap: 3 }}>
        <CommentIcon
          style={{ width: 17, height: 17 }}
          stroke={template.colors.textLight}
          strokeWidth={70}
        />
        {message.childThreadMessagesCount ? (
          <Text style={{ color: template.colors.text }}>
            {message.childThreadMessagesCount}
          </Text>
        ) : null}
      </View>
    </PressableTransformation>
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
      {likeButton || answerButton ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          {likeButton}
          {answerButton}
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
