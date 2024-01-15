import { FC, useContext, useEffect } from "react";
import { RootStackParamList } from "../types";
import {
  StackNavigationOptions,
  createStackNavigator,
} from "@react-navigation/stack";
import { Easing } from "react-native";
import { MainTabNavigator } from "./MainTabNavigator";
import { ProfileScreen } from "../screens/Profile";
import { RootDispatchContext, RootStateContext } from "./RootContext";
import { Signin } from "../screens/SignIn";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { LoadingScreen } from "../screens/Loading";

const screenOptions: StackNavigationOptions = {
  gestureDirection: "horizontal",
  transitionSpec: {
    open: {
      animation: "timing",
      config: {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      },
    },
    close: {
      animation: "timing",
      config: {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      },
    },
  },
  cardStyleInterpolator: ({ current, next, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
          {
            translateX: next
              ? next.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -layouts.screen.width], // Old screen slides out to the left
                })
              : 1,
          },
          // Add any additional transformations here
        ],
      },
    };
  },
  gestureEnabled: true,
};

const Stack = createStackNavigator<RootStackParamList>();

export const RootStackNavigator: FC = () => {
  const rootState = useContext(RootStateContext);
  const dispatch = useContext(RootDispatchContext);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch!({ type: "SIGN_IN", user });
        return;
      }

      dispatch!({ type: "SIGN_OUT" });
    });

    return () => unsubscribe();
  }, []);

  if (rootState?.userIsLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator initialRouteName="MainTabs">
      {rootState?.user ? (
        <>
          <Stack.Screen
            name="MainTabs"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={screenOptions}
          />
        </>
      ) : (
        <Stack.Screen name="SignIn" component={Signin} />
      )}
    </Stack.Navigator>
  );
};
