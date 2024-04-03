import "react-native-gesture-handler";
import {
  FlatList,
  ListRenderItem,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import { FC } from "react";
import { template } from "../../../styles/template";
import { hexToRgb } from "../../../utils/hex_to_rgb";
import { Text } from "../../../components/Text";
import { PressableTransformation } from "../../../components/PressableTransformation";
import { PressableOverlay } from "../../../components/PressableOverlay";
import { ForwardButton } from "../../../components/ForwardButton";
import { ListItem, TSpaceListItem } from "../types";

export const List: FC<{ data: ListItem[]; style?: StyleProp<ViewStyle> }> = ({
  data,
  style,
}) => {
  const renderItem: ListRenderItem<ListItem> = ({ index, item }) => {
    switch (item.type) {
      case "heading": {
        return (
          <Text
            style={{
              fontSize: 15,
              fontWeight: template.fontWeight.bold,
              marginBottom: 15,
            }}
          >
            {item.heading}
          </Text>
        );
      }
      case "empty": {
        return (
          <View
            style={{
              width: "100%",
              height: 40,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 30,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: "#aaa",
              }}
            >
              {item.message}
            </Text>
          </View>
        );
      }
      case "button": {
        return (
          <ForwardButton
            onPress={item.onPress}
            text={item.text}
            style={{ marginBottom: 20 }}
          />
        );
      }
      default: {
        return (
          <SpaceListItem
            data={item.data}
            style={{ marginBottom: 12 }}
            handleOnJoin={
              item.spaceType === "lastVisited" ? () => {} : undefined
            }
          />
        );
      }
    }
  };

  return (
    <FlatList
      style={[{ flex: 1 }, style]}
      alwaysBounceVertical={false}
      data={data}
      renderItem={renderItem}
    />
  );
};

const SpaceListItem: FC<{
  data: TSpaceListItem["data"];
  handleOnJoin?: () => void;
  style?: StyleProp<ViewStyle>;
}> = ({ data, handleOnJoin, style }) => {
  return (
    <PressableTransformation onPress={() => {}} style={style}>
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          backgroundColor: template.colors.grayLightBackground,
          height: 54,
          alignItems: "center",
          borderRadius: template.borderRadius.md,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            aspectRatio: 1,
            backgroundColor: hexToRgb(data.themeColorHexaCode, 0.35),
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 32 }}>{data.icon}</Text>
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={{ fontWeight: template.fontWeight.bold }}>
            {data.name}
          </Text>
          <Text
            style={{ color: template.colors.textLight }}
          >{`${data.lastActivity.sender} shared: ${data.lastActivity.message}`}</Text>
        </View>
        {handleOnJoin ? (
          <View style={{ paddingRight: 8 }}>
            <JoinButton onPress={handleOnJoin} />
          </View>
        ) : null}
      </View>
    </PressableTransformation>
  );
};

const JoinButton: FC<{ onPress: () => void }> = ({ onPress }) => {
  return (
    <PressableOverlay onPress={onPress} hitSlop={10}>
      <View
        style={{
          paddingHorizontal: 11,
          paddingVertical: 6,
          borderRadius: template.borderRadius.md,
          borderWidth: 1,
          borderColor: "#bbb",
          backgroundColor: template.colors.white,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: template.fontWeight.bold }}>
          join
        </Text>
      </View>
    </PressableOverlay>
  );
};
