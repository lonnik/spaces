import { FC, useEffect } from "react";
import { RootStackParamList } from "../../types";
import { MainTabNavigator } from "./MainTabNavigator";
import { ProfileScreen } from "../../screens/Profile";
import { Signin } from "../../screens/SignIn";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase";
import { LoadingScreen } from "../../screens/Loading";
import { SpaceScreen } from "../../screens/Space";
import { createCustomStackNavigator } from "../../navigators/stack_navigator";
import { NewSpaceScreen } from "../../screens/NewSpace";
import { useUserState } from "../context/UserContext";

const Stack = createCustomStackNavigator<RootStackParamList>();

export const RootStackNavigator: FC = () => {
  const [userState, dispatch] = useUserState();
  const { userIsLoading, user } = userState;

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

  if (userIsLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator initialRouteName="MainTabs">
      {user ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen
            name="NewSpace"
            component={NewSpaceScreen}
            options={{
              animation: "slideInFromBottom",
            }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              animation: "slideInFromRight",
            }}
          />
          <Stack.Screen
            name="Space"
            component={SpaceScreen}
            options={{
              animation: "slideInFromBottom",
            }}
          />
        </>
      ) : (
        <Stack.Screen name="SignIn" component={Signin} />
      )}
    </Stack.Navigator>
  );
};
