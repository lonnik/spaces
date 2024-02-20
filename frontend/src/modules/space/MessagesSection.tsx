import { FC } from "react";
import { View } from "react-native";
import { template } from "../../styles/template";
import { Text } from "../../components/Text";

export const MessagesSection: FC = () => {
  return (
    <View style={{ flex: 1 }}>
      {Array.from({ length: 20 }).map((_, index) => {
        return <Message key={index} />;
      })}
    </View>
  );
};

// from, when, answers count, like action, answer action
const Message: FC = () => {
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
          {["like", "comment"].map((action, index) => {
            return (
              <View
                key={index}
                style={{
                  paddingHorizontal: 15,
                  paddingVertical: 3,
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: template.colors.textLight,
                  marginRight: 10,
                }}
              >
                <Text>{action}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};
