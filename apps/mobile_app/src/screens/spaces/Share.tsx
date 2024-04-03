import { FC, forwardRef, useCallback, useRef, useState } from "react";
import { TextInput, TextInputProps, View } from "react-native";
import { Header } from "../../components/Header";
import { template } from "../../styles/template";
import { PrimaryButton } from "../../components/form/PrimaryButton";
import { Text } from "../../components/Text";
import { GalleryIcon } from "../../components/icons/GalleryIcon";
import { PressableOverlay } from "../../components/PressableOverlay";
import { useCustomNavigation } from "../../hooks/use_custom_navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotification } from "../../utils/notifications";
import {
  createMessage,
  createThread,
  createToplevelThread,
} from "../../utils/queries";
import { SpaceStackParamList, Uuid } from "../../types";
import { useKeyboardHeight } from "../../modules/space/hooks/use_keyboard_height";
import { useOnClose } from "../../modules/space/hooks/use_on_close";
import { cleanString } from "../../utils/strings";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StackScreenProps } from "@react-navigation/stack";
import { useSpaceColor } from "../../hooks/use_space_color";

const createThreadAndMessage = async ({
  parentThreadId,
  parentMessageId,
  spaceId,
  messageContent,
}: {
  parentThreadId: Uuid;
  parentMessageId: Uuid;
  spaceId: Uuid;
  messageContent: string;
}) => {
  const { threadId } = await createThread(
    spaceId,
    parentThreadId,
    parentMessageId
  );

  return createMessage(spaceId, threadId, messageContent);
};

// TODO: loading notification and success or error notification

export const SpaceShareScreen: FC<
  StackScreenProps<SpaceStackParamList, "Share"> & { spaceId: Uuid }
> = ({ spaceId, route }) => {
  const isNewThreadShare = !route.params;
  const [firstMessageText, setFirstMessageText] = useState("");
  const [secondMessageText, setSecondMessageText] = useState("");
  const keyboardHeight = useKeyboardHeight();
  const navigation = useCustomNavigation();
  const firstMessageRef = useRef<TextInput>(null);
  const secondMessageRef = useRef<TextInput>(null);
  const notification = useNotification();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const spaceColor = useSpaceColor();

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["spaces", spaceId],
    });
    notification.updateNotification({
      title: "You started a thread ✉️",
      type: "success",
    });
    navigation.goBack();
  }, []);

  const onError = useCallback((error: Error) => {
    console.error("error :>> ", error);
    notification.updateNotification({
      title: "Error creating new thread",
      type: "error",
    });
  }, []);

  const { mutate: createNewMessageInThread } = useMutation({
    mutationKey: ["createMessage"],
    mutationFn: ({ threadId, content }: { threadId: Uuid; content: string }) =>
      createMessage(spaceId, threadId, content),
    onError,
    onSuccess,
  });

  const { mutate: createNewThreadAndMessage } = useMutation({
    mutationKey: ["createThreadAndMessage"],
    mutationFn: createThreadAndMessage,
    onError,
    onSuccess,
  });

  const { mutate: createNewTopLevelThread } = useMutation({
    mutationKey: ["createToplevelThread"],
    mutationFn: async (content: string) => {
      return createToplevelThread(spaceId, content);
    },
    onError,
    onSuccess(data) {
      if (secondMessageText) {
        const secondMessageTextClean = cleanString(secondMessageText);

        createNewThreadAndMessage({
          parentThreadId: data.threadId,
          parentMessageId: data.firstMessageId,
          spaceId,
          messageContent: secondMessageTextClean,
        });

        return;
      }

      onSuccess();
    },
  });

  const onClose = () => {
    firstMessageRef.current?.blur();
    secondMessageRef.current?.blur();
  };

  useOnClose(onClose);

  const onSend = async () => {
    const firstMessageTextClean = cleanString(firstMessageText);

    if (!isNewThreadShare) {
      const { parentThreadId, parentMessageId, threadId } = route.params;

      notification.showNotification({
        title: "Creating New Answer ...",
        type: "loading",
        duration: 999999,
      });

      if (threadId) {
        createNewMessageInThread({ threadId, content: firstMessageTextClean });

        return;
      }

      createNewThreadAndMessage({
        parentThreadId,
        parentMessageId,
        spaceId,
        messageContent: firstMessageTextClean,
      });

      return;
    }

    notification.showNotification({
      title: "Creating New Thread ...",
      type: "loading",
      duration: 999999,
    });

    createNewTopLevelThread(firstMessageTextClean);
  };

  return (
    <View
      style={{
        flex: 1,
        paddingBottom: keyboardHeight === 0 ? insets.bottom : 0,
      }}
    >
      <Header text="Share something" onClose={onClose} displayArrowDownButton />
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
        {isNewThreadShare ? (
          <ContentInput
            ref={secondMessageRef}
            setValue={setSecondMessageText}
            value={secondMessageText}
            placeholder="Add something to the thread"
          />
        ) : null}
        <View style={{ flex: 1 }} />
        <View
          style={{
            width: "100%",
            justifyContent: "flex-end",
            flexDirection: "row",
            paddingVertical: template.paddings.screen - 5,
          }}
        >
          <PrimaryButton
            onPress={onSend}
            isDisabled={!firstMessageText}
            color={spaceColor}
          >
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
>(({ value, setValue, placeholder = "", style, ...props }, ref) => {
  return (
    <View style={{ marginBottom: 30 }}>
      <TextInput
        ref={ref}
        value={value}
        placeholder={placeholder}
        onChangeText={setValue}
        multiline={true}
        style={[
          {
            fontSize: 16,
            marginBottom: 15,
            color: template.colors.text,
            lineHeight: 22,
          },
          style,
        ]}
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
