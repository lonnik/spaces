import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { FC } from "react";
import { Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getSpaceById } from "../utils/queries";
import { LoadingScreen } from "./Loading";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Header } from "../modules/space/Header";

export const SpaceScreen: FC<StackScreenProps<RootStackParamList, "Space">> = ({
  route,
}) => {
  const { spaceId } = route.params;

  const { data: space, isLoading } = useQuery({
    queryKey: ["spaces", spaceId],
    queryFn: () => getSpaceById(spaceId),
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <BottomSheetScrollView>
        <Text>{JSON.stringify(space)}</Text>
      </BottomSheetScrollView>
    </View>
  );
};
