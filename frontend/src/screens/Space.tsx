import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { FC } from "react";
import { ScrollView, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getSpaceById } from "../utils/queries";
import { LoadingScreen } from "./Loading";
import { Header } from "../components/Header";
import { template } from "../styles/template";
import { Map } from "../components/Map";

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
      <Header text={space?.name || ""} />
      <ScrollView
        style={{
          flex: 1,
          paddingHorizontal: template.paddings.md,
          flexDirection: "column",
        }}
      >
        <Map
          radius={20}
          aspectRatio={3}
          centerCoordinate={[
            space?.location.longitude!,
            space?.location.latitude!,
          ]}
        />
      </ScrollView>
    </View>
  );
};
