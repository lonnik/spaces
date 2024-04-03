import { getRandomBytes } from "expo-crypto";

export const generateRandomURLSafeString = (length: number) => {
  const randomBytes = getRandomBytes(length);

  return Buffer.from(randomBytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};
