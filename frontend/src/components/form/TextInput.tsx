import { FC } from "react";
import {
  TextInput as NativeTextInput,
  StyleProp,
  TextStyle,
} from "react-native";
import { template } from "../../styles/template";

export const TextInput: FC<{
  value: string;
  setValue: (newValue: string) => void;
  placeholder: string;
  style?: StyleProp<TextStyle>;
}> = ({ value, setValue, placeholder, style }) => {
  return (
    <NativeTextInput
      placeholder={placeholder}
      value={value}
      onChangeText={setValue}
      placeholderTextColor={template.colors.textLight}
      style={[
        {
          borderRadius: 7,
          padding: 12,
          backgroundColor: "#eee",
          fontSize: 17,
          fontWeight: "500",
          color: template.colors.text,
        },
        style,
      ]}
    />
  );
};
