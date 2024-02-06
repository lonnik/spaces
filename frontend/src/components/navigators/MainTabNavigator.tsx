import {
  BottomTabBarProps,
  BottomTabNavigationEventMap,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { TabsParamList } from "../../types";
import { HereScreen } from "../../screens/Here";
import { FC, Fragment } from "react";
import { MySpacesScreen } from "../../screens/MySpaces";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HereIcon } from "../icons/HereIcon";
import { MySpacesIcon } from "../icons/MySpacesIcon";
import { AddSpaceIcon } from "../icons/AddSpaceIcon";
import { template } from "../../styles/template";
import { NavigationHelpers, ParamListBase } from "@react-navigation/native";
import { HereIconAcive } from "../icons/HereIconActice";

const Tabs = createBottomTabNavigator<TabsParamList>();

const MySpacesTabBarIcon: FC<{ focused: boolean }> = ({ focused }) => {
  return (
    <MySpacesIcon
      stroke={template.colors.text}
      fill={focused ? template.colors.text : "none"}
    />
  );
};

const HereTabBarIcon: FC<{ focused: boolean }> = ({ focused }) => {
  if (focused) {
    return <HereIconAcive />;
  }

  return <HereIcon stroke={template.colors.text} />;
};

const AddSpaceTabBarIcon: FC = () => {
  return <AddSpaceIcon stroke={template.colors.purple} />;
};

const TabBarItem: FC<{
  target: string;
  isFocused: boolean;
  tabBarIcon: React.ReactNode;
  routeName: string;
  routeParams: Readonly<object | undefined>;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
}> = ({
  isFocused,
  navigation,
  target,
  routeName,
  routeParams,
  tabBarIcon,
}) => {
  const onPress = () => {
    const event = navigation.emit({
      type: "tabPress",
      target,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName, routeParams);
    }
  };

  const onLongPress = () => {
    navigation.emit({
      type: "tabLongPress",
      target,
    });
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      onLongPress={onLongPress}
      style={{ flex: 1, alignItems: "center" }}
      key={routeName}
    >
      {tabBarIcon}
    </Pressable>
  );
};

const TabBar: FC<BottomTabBarProps & { bottomInsets: number }> = ({
  state,
  descriptors,
  navigation,
  bottomInsets,
}) => {
  const middleIndex = Math.floor(state.routes.length / 2);

  const addSpaceItem = (
    <TabBarItem
      isFocused={false}
      tabBarIcon={<AddSpaceTabBarIcon />}
      navigation={navigation}
      routeName="NewSpace"
      routeParams={{}}
      target="NewSpace"
    />
  );

  return (
    <View
      style={{
        width: "100%",
        paddingBottom: bottomInsets,
        backgroundColor: "#f7f7f7",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          height: 50,
          alignItems: "center",
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const tabBarItem = (
            <TabBarItem
              isFocused={isFocused}
              navigation={navigation}
              routeName={route.name}
              routeParams={route.params}
              tabBarIcon={options.tabBarIcon?.({
                focused: isFocused,
                color: template.colors.text,
                size: 24,
              })}
              target={route.key}
              key={route.key}
            />
          );

          if (index === middleIndex) {
            return (
              <Fragment key={route.key}>
                {addSpaceItem}
                {tabBarItem}
              </Fragment>
            );
          }

          return tabBarItem;
        })}
      </View>
    </View>
  );
};

export const MainTabNavigator: FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tabs.Navigator
      tabBar={(props: BottomTabBarProps) => (
        <TabBar {...props} bottomInsets={insets.bottom} />
      )}
    >
      <Tabs.Screen
        name="Here"
        component={HereScreen}
        options={{ headerShown: false, tabBarIcon: HereTabBarIcon }}
      />
      <Tabs.Screen
        name="MySpaces"
        component={MySpacesScreen}
        options={{ headerShown: false, tabBarIcon: MySpacesTabBarIcon }}
      />
    </Tabs.Navigator>
  );
};
