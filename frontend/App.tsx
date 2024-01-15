import "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { RootStackNavigator } from "./src/components/RootStackNavigator";
import { RootStateProvider } from "./src/components/RootContext";

export default function App() {
  return (
    <RootStateProvider>
      <NavigationContainer>
        <SafeAreaProvider>
          <RootStackNavigator />
        </SafeAreaProvider>
      </NavigationContainer>
    </RootStateProvider>
  );
}
