import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { Signin } from "./screens/SignIn";

export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaProvider>
        <Signin />
      </SafeAreaProvider>
    </NavigationContainer>
  );
}
