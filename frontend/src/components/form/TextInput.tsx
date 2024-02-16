import { FC, useEffect } from "react";
import {
  TextInput as NativeTextInput,
  StyleProp,
  TextStyle,
  View,
} from "react-native";
import { template } from "../../styles/template";
import { Text } from "../Text";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { WarningIcon } from "../icons/WarningIcon";
import { hexToRgb } from "../../utils/hex_to_rgb";

const AnimatedTextInput = Animated.createAnimatedComponent(NativeTextInput);

const animationDuration = 200;

const backGroundErrorColor = hexToRgb(template.colors.error, 0.7)!;

export type TextInputError = {
  code: string;
  message: string;
};

export const TextInput: FC<{
  text: string;
  setText: (newText: string) => void;
  placeholder: string;
  errors: TextInputError[];
  onBlur?: () => void;
  style?: StyleProp<TextStyle>;
}> = ({ text, setText, placeholder, errors, style, onBlur = () => {} }) => {
  const hasErrors = errors.length > 0;
  const hasErrorsSv = useSharedValue(hasErrors);

  useEffect(() => {
    hasErrorsSv.value = hasErrors;
  }, [errors]);

  const animatedBackgroundColor = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(
        hasErrorsSv.value ? backGroundErrorColor : "#eee",
        {
          duration: animationDuration / 2,
        }
      ),
    };
  });

  return (
    <View>
      <AnimatedTextInput
        placeholder={placeholder}
        value={text}
        onChangeText={setText}
        onBlur={onBlur}
        returnKeyType="next"
        placeholderTextColor={template.colors.textLight}
        style={[
          {
            borderRadius: 7,
            paddingHorizontal: 12,
            paddingVertical: 13,
            fontSize: template.fontSizes.md,
            fontWeight: "500",
            color: template.colors.text,
            marginBottom: 5,
          },
          style,
          animatedBackgroundColor,
        ]}
      />
      {hasErrors ? (
        errors.map((error) => {
          return <Error error={error.message} key={error.message} />;
        })
      ) : (
        <View style={{ height: 20 }} />
      )}
    </View>
  );
};

const Error: FC<{ error: string }> = ({ error }) => {
  const isRenderedSv = useSharedValue(false);

  useEffect(() => {
    isRenderedSv.value = true;

    return () => {
      isRenderedSv.value = false;
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(isRenderedSv.value ? 0 : -5, {
            duration: animationDuration,
          }),
        },
      ],
      opacity: withTiming(isRenderedSv.value ? 1 : 0, {
        duration: animationDuration,
      }),
    };
  });

  return (
    <Animated.View
      style={[
        { flex: 1, flexDirection: "row", alignItems: "center", height: 20 },
        animatedStyle,
      ]}
    >
      <WarningIcon
        fill={template.colors.error}
        style={{ height: 17, width: 17, marginRight: 5 }}
      />
      <Text
        style={[
          {
            color: template.colors.error,
            fontSize: 14,
          },
        ]}
      >
        {error}
      </Text>
    </Animated.View>
  );
};
