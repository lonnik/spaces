import { FC, useState } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { template } from "../../styles/template";
import { Text } from "../../components/Text";
import { Uuid, type Message as TMessage } from "../../types";
import { useMutation } from "@tanstack/react-query";
import { createMessageLike } from "../../utils/queries";
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
  fontSize = 26,
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

  displayAnswersCount =
    displayAnswersCount && !!message.childThreadMessagesCount;

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
      {displayLikeButton || displayAnswersCount ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          {displayLikeButton ? (
            <View style={{ minWidth: 55 }}>
              <LikeButton2
                likes={message.likesCount}
                onPress={onLikeButtonPress}
                isLikedByUser={isLiked}
              />
            </View>
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
