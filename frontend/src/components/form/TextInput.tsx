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
            padding: 12,
            backgroundColor: "#eee",
            fontSize: 17,
            fontWeight: "500",
            borderWidth: 3,
            color: template.colors.text,
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
        <Error error="" />
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
    <Animated.View style={animatedStyle}>
      <Text
        style={[
          {
            color: error.length > 0 ? template.colors.error : "transparent",
            marginTop: 5,
            fontSize: 14,
          },
        ]}
      >
        {error || "no error"}
      </Text>
    </Animated.View>
  );
};
