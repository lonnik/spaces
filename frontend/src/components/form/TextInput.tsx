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

const AnimatedTextInput = Animated.createAnimatedComponent(NativeTextInput);

const animationDuration = 200;

export const TextInput: FC<{
  text: string;
  setText: (newText: string) => void;
  placeholder: string;
  errors: string[];
  style?: StyleProp<TextStyle>;
}> = ({ text, setText, placeholder, errors, style }) => {
  const hasErrors = errors.length > 0;
  const hasErrorsSv = useSharedValue(hasErrors);

  useEffect(() => {
    hasErrorsSv.value = hasErrors;
  }, [errors]);

  const animatedBorderColor = useAnimatedStyle(() => {
    return {
      borderColor: withTiming(
        hasErrorsSv.value ? template.colors.error : "transparent",
        {
          duration: animationDuration,
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
        returnKeyType="next"
        placeholderTextColor={template.colors.textLight}
        style={[
          {
            borderRadius: 7,
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: "#eee",
            fontSize: template.fontSizes.md,
            fontWeight: "500",
            borderWidth: 3,
            color: template.colors.text,
            marginBottom: 5,
          },
          style,
          animatedBorderColor,
        ]}
      />
      {hasErrors ? (
        errors.map((error) => {
          return <Error error={error} key={error} />;
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
