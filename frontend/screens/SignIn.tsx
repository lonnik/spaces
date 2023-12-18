import { FC, useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { maybeCompleteAuthSession } from "expo-web-browser";
import {
  CodeChallengeMethod,
  ResponseType,
  useAuthRequest,
} from "expo-auth-session";
import { Buffer } from "buffer";
import {
  AppleAuthenticationButton,
  AppleAuthenticationButtonStyle,
  AppleAuthenticationButtonType,
  AppleAuthenticationScope,
  signInAsync,
} from "expo-apple-authentication";
import { getRandomBytes } from "expo-crypto";

const generateRandomURLSafeString = (length: number) => {
  const randomBytes = getRandomBytes(length);

  return Buffer.from(randomBytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

const signUpGoogle = async (authCode: string, codeVerifier: string) => {
  try {
    const request = new Request(
      "http://localhost:8080/api/users/provider/google",
      {
        method: "POST",
        body: JSON.stringify({
          codeVerifier,
          authCode,
        }),
      }
    );

    const response = await fetch(request);
    const json = await response.json();
    console.log("json :>> ", json);
  } catch (error: any) {
    console.error(error);
  }
};

maybeCompleteAuthSession();

export const Signin: FC<{}> = ({}) => {
  const [state, setState] = useState(generateRandomURLSafeString(32));
  const [codeChallenge, setCodeChallenge] = useState(
    generateRandomURLSafeString(32)
  );

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId:
        "761033409352-qg2008kkuf6f2jlm9vbh025qj3emih95.apps.googleusercontent.com",
      responseType: ResponseType.Code,
      scopes: ["openid", "profile", "email"],
      redirectUri:
        "https://2e5d-2003-ca-5f3a-3500-9125-c037-490c-b88d.ngrok-free.app/api/google-oauthcallback",
      codeChallenge: codeChallenge,
      state: state,
      codeChallengeMethod: CodeChallengeMethod.S256,
    },
    { authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth" }
  );

  useEffect(() => {
    if (response?.type === "success") {
      if (response.params?.state !== state) {
        console.error("State mismatch. Potential CSRF attack.");
        return;
      }

      if (request?.codeVerifier) {
        signUpGoogle(response.params.code, request.codeVerifier);
      }
    }

    if (response?.type === "error") {
      console.error("Authentication error:", response.error);
    }
  }, [response]);

  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top, flex: 1, alignItems: "center" }}>
      <View style={{ marginTop: 25 }}>
        <Button
          title="Log in with Google"
          onPress={() => {
            promptAsync();
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
    </View>
  );
};
