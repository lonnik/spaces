import { FC } from "react";
import { ActivityIndicator, View } from "react-native";

export const NextPageLoadingIndicator: FC<{
  isLoading: boolean;
  hasNextPage: boolean;
}> = ({ isLoading, hasNextPage }) => {
  if (!hasNextPage) {
    return null;
  }

  return (
    <View
      style={{
        height: 60,
        justifyContent: "center",
        alignContent: "center",
      }}
    >
      {isLoading ? <ActivityIndicator /> : null}
    </View>
  );
};
