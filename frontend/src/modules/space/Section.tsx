import { FC, ReactNode } from "react";
import { View } from "react-native";
import { Heading3 } from "../../components/headings";

export const Section: FC<{ children: ReactNode; headingText: string }> = ({
  children,
  headingText,
}) => {
  return (
    <View style={{ gap: 10 }}>
      <Heading3>{headingText}</Heading3>
      {children}
    </View>
  );
};
