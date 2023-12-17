import { SafeAreaProvider } from "react-native-safe-area-context";
import { Signin } from "./screens/SignIn";
import { NavigationContainer } from "@react-navigation/native";

export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaProvider>
        <Signin />
      </SafeAreaProvider>
    </NavigationContainer>
  );
}
