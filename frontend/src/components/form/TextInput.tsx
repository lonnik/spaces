import { FC } from "react";
import { StyleProp, TextStyle } from "react-native";
import { TextInput as NativeTextInput } from "react-native-gesture-handler";

export const TextInput: FC<{
  value: string;
  setValue: (newValue: string) => void;
  placeholder: string;
  style?: StyleProp<TextStyle>;
}> = ({ value, setValue, placeholder, style }) => {
  return (
    <NativeTextInput
      value={value}
      placeholder={placeholder}
      onChangeText={setValue}
      style={[
        {
          borderRadius: 7,
          padding: 12,
          backgroundColor: "#eee",
          fontSize: 20,
        },
        style,
      ]}
    />
  );
};
