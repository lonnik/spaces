import { FC, forwardRef, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { Header } from "../../components/Header";
import { template } from "../../styles/template";
import { PrimaryButton } from "../../components/form/PrimaryButton";
import { Text } from "../../components/Text";
import { GalleryIcon } from "../../components/icons/GalleryIcon";
import { useCustomNavigation } from "../../components/context/GoBackContext";

export const SpaceShareScreen: FC = () => {
  const [firstMessageText, setFirstMessageText] = useState("");
  const [secondMessageText, setSecondMessageText] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const navigation = useCustomNavigation();
  const firstMessageRef = useRef<TextInput>(null);
  const secondMessageRef = useRef<TextInput>(null);

  const onClose = () => {
    firstMessageRef.current?.blur();
    secondMessageRef.current?.blur();
  };

  const onSend = () => {
    navigation.goBack();
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", onClose);

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={{ flex: 1 }}>
      <Header text="Share something" onClose={onClose} />
      <View
        style={{
          flex: 1,
          paddingHorizontal: template.paddings.screen,
          paddingBottom: keyboardHeight,
        }}
      >
        <ContentInput
          ref={firstMessageRef}
          setValue={setFirstMessageText}
          value={firstMessageText}
          placeholder="Start a thread ..."
          autoFocus={true}
        />
        <ContentInput
          ref={secondMessageRef}
          setValue={setSecondMessageText}
          value={secondMessageText}
          placeholder="Add something to the thread"
        />
        <View style={{ flex: 1 }} />
        <View
          style={{
            width: "100%",
            justifyContent: "flex-end",
            flexDirection: "row",
            paddingVertical: template.paddings.screen - 5,
          }}
        >
          <PrimaryButton onPress={onSend} isDisabled={!firstMessageText}>
            <Text
              style={{
                color: template.colors.white,
                textTransform: "lowercase",
              }}
            >
              Share
            </Text>
          </PrimaryButton>
        </View>
      </View>
    </View>
  );
};

// TODO: create OverlayPressable component

const ContentInput = forwardRef<
  TextInput,
  {
    value: string;
    setValue: (newValue: string) => void;
    placeholder?: string;
  } & TextInputProps
>(({ value, setValue, placeholder = "", ...props }, ref) => {
  return (
    <View style={{ marginBottom: 30 }}>
      <TextInput
        ref={ref}
        value={value}
        placeholder={placeholder}
        onChangeText={setValue}
        multiline={true}
        style={{
          fontSize: 16,
          marginBottom: 15,
          color: template.colors.text,
          lineHeight: 22,
        }}
        {...props}
      />
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable hitSlop={5}>
          <GalleryIcon
            style={{ width: 22, height: 22 }}
            fill={template.colors.text}
          />
        </Pressable>
      </View>
    </View>
  );
});
