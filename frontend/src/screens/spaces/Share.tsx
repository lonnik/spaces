import { FC, forwardRef, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { Header } from "../../components/Header";
import { template } from "../../styles/template";
import { PrimaryButton } from "../../components/form/PrimaryButton";
import { Text } from "../../components/Text";
import { GalleryIcon } from "../../components/icons/GalleryIcon";
import { PressableOverlay } from "../../components/PressableOverlay";
import { useCustomNavigation } from "../../hooks/use_custom_navigation";
import { useMutation } from "@tanstack/react-query";
import { useNotification } from "../../utils/notifications";
import { createToplevelThread } from "../../utils/queries";
import { Uuid } from "../../types";

// TODO: loading notification and success or error notification

export const SpaceShareScreen: FC<{ spaceId: Uuid }> = ({ spaceId }) => {
  const [firstMessageText, setFirstMessageText] = useState("");
  const [secondMessageText, setSecondMessageText] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const navigation = useCustomNavigation();
  const firstMessageRef = useRef<TextInput>(null);
  const secondMessageRef = useRef<TextInput>(null);

  const notification = useNotification();

  const { mutate: createNewTopLevelThread } = useMutation({
    mutationFn: async (content: string) => {
      return createToplevelThread(spaceId, content);
    },
    mutationKey: ["createToplevelThread"],
    onError(error) {
      console.error("error :>> ", error);
      notification.updateNotification({
        title: "Error creating new thread",
        type: "error",
      });
    },
    onSuccess() {
      navigation.goBack();
      notification.updateNotification({
        title: "You started a thread ✉️",
        type: "success",
      });
    },
  });

  const onClose = () => {
    firstMessageRef.current?.blur();
    secondMessageRef.current?.blur();
  };

  const onSend = async () => {
    notification.showNotification({
      title: "Creating New Thread ...",
      type: "loading",
      duration: 999999,
    });

    createNewTopLevelThread(firstMessageText);
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
        <PressableOverlay onPress={() => {}} hitSlop={10}>
          <GalleryIcon
            style={{ width: 22, height: 22 }}
            fill={template.colors.text}
          />
        </PressableOverlay>
      </View>
    </View>
  );
});
