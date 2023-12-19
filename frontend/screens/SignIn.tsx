import { FC, useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { maybeCompleteAuthSession } from "expo-web-browser";
import { useAuthRequest } from "expo-auth-session/providers/google";
import {
  AppleAuthenticationButton,
  AppleAuthenticationButtonStyle,
  AppleAuthenticationButtonType,
  AppleAuthenticationScope,
  signInAsync,
} from "expo-apple-authentication";
import { auth } from "../firebase";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
} from "firebase/auth";
import { fetchApi } from "../utils/fetch_api";

maybeCompleteAuthSession();

export const Signin: FC<{}> = ({}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [_, response, promptAsync] = useAuthRequest({
    iosClientId:
      "717063629448-ctoeh0a3vdaknng6cvmb2d23v1mjttk1.apps.googleusercontent.com",
    androidClientId:
      "717063629448-u808b96qbshbccogqoq7fnvf86fv33ne.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token: idToken } = response.params;
      const credential = GoogleAuthProvider.credential(idToken);

      signInWithCredential(auth, credential)
        .then((userCredential) => {
          const firebaseIdToken = (userCredential as any)?._tokenResponse
            ?.idToken as string;

          if (!firebaseIdToken) {
            throw new Error("firebaseIdToken is undefined");
          }

          return fetchApi("/users", {
            method: "POST",
            body: JSON.stringify({
              idToken: firebaseIdToken,
            }),
          });
        })
        .catch((error) => {
          console.error("error :>>", error);

          return signOut(auth);
        })
        .catch((error) => console.error("error :>>", error));
    }

    if (response?.type === "error") {
      console.error("Authentication error:", response.error);
    }
  }, [response]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        return;
      }

      setIsLoggedIn(false);
    });

    return () => unsubscribe();
  }, []);

  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top, flex: 1, alignItems: "center" }}>
      <Text style={{ fontSize: 30 }}>
        {isLoggedIn ? "is logged in" : "is not logged in"}
      </Text>
      <View style={{ marginTop: 25 }}>
        <Button
          title="Log in with Google"
          onPress={() => {
            promptAsync().catch((error) => console.error("error :>>", error));
          }}
        />
      </View>
      <AppleAuthenticationButton
        buttonType={AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={10}
        style={{ height: 50, width: "60%", marginTop: 25 }}
        onPress={async () => {
          try {
            const credential = await signInAsync({
              requestedScopes: [
                AppleAuthenticationScope.FULL_NAME,
                AppleAuthenticationScope.EMAIL,
              ],
            });
            console.log("credential :>> ", credential);
          } catch (e: any) {
            if (e.code === "ERR_REQUEST_CANCELED") {
              // handle that the user canceled the sign-in flow
            } else {
              // handle other errors
            }
          }
        }}
      />
      <View style={{ marginTop: 25 }}>
        <Button
          title="sign out"
          onPress={() => {
            signOut(auth).catch((error) => console.error("error :>>", error));
          }}
        />
      </View>
    </View>
  );
};
