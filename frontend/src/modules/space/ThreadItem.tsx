import { FC, useEffect, useState } from "react";
import { Pressable, StyleProp, View, ViewStyle } from "react-native";
import { template } from "../../styles/template";
import { Text } from "../../components/Text";
import { HeartIcon } from "../../components/icons/HeartIcon";
import { PointIcon } from "../../components/icons/PointIcon";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type User = {
  id: string;
  username: string;
  avatar: string;
};

type MessageContent = {
  text: string;
  images?: string[];
};

export type Message = {
  id: string;
  from: User;
  when: Date;
  content: MessageContent;
  likes: number;
  answers?: Message[];
};

// TODO:
// display date function
// text size function
export const ThreadItem: FC<{
  message: Message;
  style?: StyleProp<ViewStyle>;
}> = ({ message, style }) => {
  return (
    <View style={[{ flex: 1 }, style]}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 5,
        }}
      >
        <Avatar size={32} style={{ marginRight: 7 }} />
        <Text style={{ color: template.colors.text, fontWeight: "bold" }}>
          {message.from.username}
        </Text>
        <PointIcon
          style={{ width: 4, height: 4, marginHorizontal: 10 }}
          fill={template.colors.textLight}
        />
        <Text style={{ color: template.colors.textLight }}>2h</Text>
      </View>
      <View style={{ marginBottom: 10 }}>
        <Message
          message={message}
          style={{ paddingHorizontal: 12, paddingVertical: 8, gap: 12 }}
          displayLikeButton={true}
        />
      </View>
      <View style={{ flex: 1, flexDirection: "row", gap: 5 }}>
        <Avatar size={22} />
        <Message
          message={message.answers![0]}
          style={{ paddingVertical: 6, paddingHorizontal: 8, gap: 8 }}
          fontSize={14}
        />
      </View>
    </View>
  );
};

const Avatar: FC<{ size: number; style?: StyleProp<ViewStyle> }> = ({
  size,
  style,
}) => {
  return (
    <View
      style={[
        {
          width: size,
          aspectRatio: 1,
          backgroundColor: "#ddd",
          borderRadius: 999,
        },
        style,
      ]}
    />
  );
};

const Message: FC<{
  message: Message;
  displayLikeButton?: boolean;
  style?: StyleProp<ViewStyle>;
  fontSize?: number;
}> = ({ message, style, fontSize = 26, displayLikeButton = false }) => {
  const [isLiked, setIsLiked] = useState(false);

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
      <Text style={{ fontSize }}>{message.content.text}</Text>
      {displayLikeButton || message.answers?.length ? (
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
              likes={message.likes}
              onPress={() => {
                setTimeout(() => setIsLiked((oldValue) => !oldValue), 1000);
              }}
              isLiked={isLiked}
            />
          ) : null}
          {message.answers?.length ? (
            <Text style={{ color: template.colors.textLight }}>{`${
              message.answers?.length || 0
            } answers`}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const LikeButton: FC<{
  likes: number;
  onPress: () => void;
  isLiked?: boolean;
}> = ({ likes, onPress, isLiked = false }) => {
  const [internalLikes, setInternalLikes] = useState(likes);

  const isScaledDownSv = useSharedValue(false);
  const isSelected = useSharedValue(isLiked);

  useEffect(() => {
    setInternalLikes(likes);
  }, [likes]);

  const animatedContainerStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: isScaledDownSv.value
            ? withTiming(0.9, { duration: 50 })
            : withTiming(1, { duration: 50 }),
        },
      ],
      backgroundColor: isSelected.value
        ? template.colors.purple
        : "transparent",
    };
  });

  const animatedColorStyles = useAnimatedStyle(() => {
    return {
      color: isSelected.value ? template.colors.white : template.colors.purple,
    };
  });

  const onPressHandler = () => {
    isScaledDownSv.value = true;
    isSelected.value = !isSelected.value;
    setInternalLikes((oldValue) =>
      isSelected.value ? oldValue - 1 : oldValue + 1
    );
    setTimeout(() => {
      isScaledDownSv.value = false;
    }, 50);
    onPress();
  };

  return (
    <Pressable onPress={onPressHandler} hitSlop={10}>
      <Animated.View
        style={[
          {
            flexDirection: "row",
            gap: 4,
            alignItems: "center",
            borderWidth: 1,
            borderRadius: 7,
            paddingVertical: 3,
            paddingHorizontal: 8,
            borderColor: template.colors.purple,
          },
          animatedContainerStyles,
        ]}
      >
        <AnimatedHeartIcon
          style={[{ width: 14, height: 14 }, animatedColorStyles as any]}
        />
        <Animated.Text
          style={[
            {
              color: isLiked ? template.colors.white : template.colors.purple,
              fontWeight: "400",
              fontSize: 13,
            },
            animatedColorStyles,
          ]}
        >
          {internalLikes.toString()}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

const AnimatedHeartIcon = Animated.createAnimatedComponent(HeartIcon);
