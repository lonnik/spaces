import { FC } from "react";
import { User } from "../../../types";
import { View } from "react-native";
import { Avatar } from "../../../components/Avatar";

export const AvatarRow: FC<{ data: Pick<User, "id">[] }> = ({ data }) => {
  return (
    <View
      style={{
        flexDirection: "row",
      }}
    >
      {data.map((spaceSubscriber, index) => {
        return (
          <Avatar
            key={spaceSubscriber.id}
            style={{ marginLeft: index === 0 ? 0 : -12 }}
          />
        );
      })}
    </View>
  );
};
