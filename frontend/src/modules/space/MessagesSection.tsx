import { FC } from "react";
import { View } from "react-native";
import { template } from "../../styles/template";
import { Text } from "../../components/Text";
import { CommentIcon } from "../../components/icons/CommentIcon";
import { HeartIcon } from "../../components/icons/HeartIcon";

// from, when, answers count, like action, answer action
export const Message: FC = () => {
  return (
    <View style={{ flex: 1, marginBottom: 20, flexDirection: "row" }}>
      <View
        style={{
          width: 38,
          aspectRatio: 1,
          backgroundColor: "#ddd",
          borderRadius: 999,
          marginRight: 10,
        }}
      />
      <View style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            marginBottom: 3,
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontWeight: "600",
              fontSize: 14,
            }}
          >
            Thenick
          </Text>
          <Text style={{ color: template.colors.textLight }}>7 hrs</Text>
        </View>
        <Text
          style={{
            color: template.colors.text,
            marginBottom: 10,
          }}
        >
          Lorem ipsum dolor sit amet, consectetur. adipiscing elit. Vivamus in
          odio nec leo lacinia
        </Text>
        <View style={{ flex: 1, flexDirection: "row" }}>
          {[
            <CommentIcon
              style={{ width: 14, height: 14 }}
              stroke={template.colors.textLight}
            />,
            <HeartIcon
              style={{ width: 14, height: 14 }}
              fill={template.colors.textLight}
            />,
          ].map((icon, index) => {
            return (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginRight: 10,
                }}
                key={index}
              >
                {icon}
                <Text
                  style={{ color: template.colors.textLight, marginLeft: 2 }}
                >
                  3
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};
