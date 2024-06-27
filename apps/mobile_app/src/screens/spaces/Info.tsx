import { FC, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { Header } from "../../components/Header";
import { useQuery } from "@tanstack/react-query";
import { SpaceStackParamList, Uuid } from "../../types";
import { getSpaceById } from "../../utils/queries";
import { template } from "../../styles/template";
import { Text } from "../../components/Text";
import { Map } from "../../components/Map";
import { FillLayer, LineLayer, ShapeSource } from "@rnmapbox/maps";
import { hexToRgb } from "../../utils/hex_to_rgb";
import { createGeoJSONCircle } from "../../utils/map";
import { Avatar } from "../../components/Avatar";
import { AvatarRow } from "../../modules/space/components/AvatarRow";
import { ArrowForward } from "../../components/icons/ArrowForward";
import { PressableTransformation } from "../../components/PressableTransformation";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Section } from "../../modules/space/components/Section";
import { useSpaceColor } from "../../hooks/use_space_color";

export const SpaceInfoScreen: FC<{ spaceId: Uuid }> = ({ spaceId }) => {
  const { data } = useQuery({
    queryKey: ["spaces", spaceId],
    queryFn: () => getSpaceById(spaceId),
  });

  const spaceColor = useSpaceColor();

  const navigation = useNavigation<StackNavigationProp<SpaceStackParamList>>();

  if (!data) {
    return null;
  }

  const geoJSONCircle = useMemo(
    () => createGeoJSONCircle(data.location, data.radius, 60),
    [data.radius, data.location]
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header text="Info" displayArrowBackButton />
      <ScrollView
        style={{ flex: 1 }}
        alwaysBounceVertical={false}
        contentContainerStyle={{
          gap: 30,
          paddingHorizontal: template.paddings.md,
          paddingBottom: 50,
        }}
      >
        <Section headingText="Description">
          <Text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.{" "}
          </Text>
        </Section>
        <Section headingText="Location">
          <View style={{ gap: 10 }}>
            <Text>Baumbachstr. 5, 13189 Berlin</Text>
            <Map
              style={{
                width: "100%",
                borderRadius: template.borderRadius.md,
                overflow: "hidden",
                borderWidth: 1,
              }}
              aspectRatio={2.1}
              centerCoordinate={data.location}
              radius={data.radius}
            >
              <ShapeSource
                id="circleSource"
                shape={geoJSONCircle}
                tolerance={0.1}
              >
                <FillLayer
                  id="circleFill"
                  style={{
                    fillColor: spaceColor,
                    fillOpacity: 0.18,
                  }}
                />
                <LineLayer
                  id="circleLine"
                  style={{
                    lineColor: hexToRgb(spaceColor, 0.22),
                    lineWidth: 1,
                  }}
                />
              </ShapeSource>
            </Map>
          </View>
        </Section>
        <Section headingText="Subscribers">
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <PressableTransformation
              onPress={() => {
                navigation.navigate("Subscribers");
              }}
            >
              <AvatarRow
                data={[
                  { id: "1" },
                  { id: "2" },
                  { id: "3" },
                  { id: "4" },
                  { id: "5" },
                  { id: "6" },
                  { id: "7" },
                  { id: "8" },
                ]}
              />
            </PressableTransformation>
            <ForwardButton
              onPress={() => {
                navigation.navigate("Subscribers");
              }}
              text="All Subscribers"
            />
          </View>
        </Section>
        <Section headingText="Admin">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Avatar />
            <Text style={{ fontWeight: template.fontWeight.bold }}>niko</Text>
          </View>
        </Section>
        <Section headingText="Category">
          <View
            style={{
              alignSelf: "flex-start",
              paddingHorizontal: 10,
              paddingVertical: 2,
              flexDirection: "row",
              alignItems: "center",
              gap: 3,
              backgroundColor: hexToRgb(spaceColor, 0.4),
              borderRadius: template.borderRadius.md,
            }}
          >
            <Text
              style={{ fontSize: 12, fontWeight: template.fontWeight.bold }}
            >
              Neighbourhood
            </Text>
            <Text style={{ fontSize: 13 }}>🍺</Text>
          </View>
        </Section>
      </ScrollView>
    </View>
  );
};

const ForwardButton: FC<{ text: string; onPress: () => void }> = ({
  text,
  onPress,
}) => {
  return (
    <PressableTransformation onPress={onPress}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text
          style={{
            fontWeight: template.fontWeight.bold,
          }}
        >
          {text}
        </Text>
        <ArrowForward
          fill={template.colors.text}
          style={{ width: 15, height: 12 }}
        />
      </View>
    </PressableTransformation>
  );
};
