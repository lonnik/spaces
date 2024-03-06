import { FC } from "react";
import { ScrollView, View } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { Header } from "../components/Header";
import { template } from "../styles/template";
import { Avatar } from "../components/Avatar";
import { useQuery } from "@tanstack/react-query";
import { useUserState } from "../hooks/use_current_user";
import { getUser } from "../utils/queries";
import { Text } from "../components/Text";
import { ForwardButton } from "../components/ForwardButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const ProfileScreen: FC = () => {
  const [{ user }] = useUserState();

  const { data } = useQuery({
    enabled: !!user?.uid,
    queryKey: ["users", user?.uid],
    queryFn: async () => {
      return getUser(user?.uid!);
    },
  });

  const insets = useSafeAreaInsets();

  const fullName = data?.firstName
    ? data.firstName + (data.lastName ? ` ${data.lastName}` : "")
    : "";

  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error("error :>>", error));
  };

  return (
    <View style={{ flex: 1 }}>
      <Header text="Profile" displayArrowBackButton />
      <ScrollView
        style={{ flex: 1 }}
        alwaysBounceVertical={false}
        contentContainerStyle={{
          flex: 1,
          gap: 30,
          paddingHorizontal: template.paddings.md,
          justifyContent: "space-between",
          paddingBottom: insets.bottom + template.paddings.md,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 20,
            alignItems: "center",
            marginTop: template.paddings.md,
          }}
        >
          <Avatar size={100} />
          <Text style={{ fontSize: 18, fontWeight: "600" }}>{fullName}</Text>
        </View>
        <ForwardButton
          onPress={handleSignOut}
          style={{ marginBottom: template.paddings.md }}
          text="Logout"
          color={template.colors.red}
        />
      </ScrollView>
    </View>
  );
};
