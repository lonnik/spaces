import { FC, useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { maybeCompleteAuthSession } from "expo-web-browser";
import {
  CodeChallengeMethod,
  ResponseType,
  useAuthRequest,
} from "expo-auth-session";
import {
  digestStringAsync,
  CryptoDigestAlgorithm,
  getRandomBytes,
} from "expo-crypto";
import { Buffer } from "buffer";
import {
  AppleAuthenticationButton,
  AppleAuthenticationButtonStyle,
  AppleAuthenticationButtonType,
  AppleAuthenticationScope,
  signInAsync,
} from "expo-apple-authentication";

const generateRandomURLSafeString = (length: number) => {
  const randomBytes = getRandomBytes(length);
  return Buffer.from(randomBytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

const generateCodeChallenge = async (codeVerifier: string) => {
  return await digestStringAsync(CryptoDigestAlgorithm.SHA256, codeVerifier);
};

maybeCompleteAuthSession();

export const Signin: FC<{}> = ({}) => {
  const [state, setState] = useState(generateRandomURLSafeString(32));
  const [codeVerifier, setCodeVerifier] = useState("");
  const [codeChallenge, setCodeChallenge] = useState("");

  useEffect(() => {
    const newCodeVerifier = generateRandomURLSafeString(43);

    setCodeVerifier(newCodeVerifier);
    generateCodeChallenge(newCodeVerifier)
      .then((newCodeChallenge) => setCodeChallenge(newCodeChallenge))
      .catch((err: any) => console.error(err));
  }, []);

  const [_, response, promptAsync] = useAuthRequest(
    {
      clientId:
        "761033409352-qg2008kkuf6f2jlm9vbh025qj3emih95.apps.googleusercontent.com",
      responseType: ResponseType.Code,
      scopes: ["openid", "profile", "email"],
      redirectUri:
        "https://1788-2003-ca-5f3a-3500-9125-c037-490c-b88d.ngrok-free.app/oauthcallback",
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

      // TODO: create endpoint and send code and code verifier to it
      console.log("response.params.code :>> ", response.params.code);
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
