import { template } from "../../styles/template";
import { TSpaceListItem } from "./types";

export const lastVisitedSpaces: TSpaceListItem[] = [
  {
    icon: "🏠",
    lastActivity: {
      sender: "nicknick",
      message: "I'm back home",
    },
    name: "Thule32",
    themeColorHexaCode: template.colors.purple,
  },
  {
    icon: "🏓",
    lastActivity: {
      sender: "nicknick",
      message: "I'm back home",
    },
    name: "Thule32",
    themeColorHexaCode: "#212078",
  },
  {
    icon: "🍺",
    lastActivity: {
      sender: "nicknick",
      message: "I'm back home",
    },
    name: "Thule32",
    themeColorHexaCode: "#69701e",
  },
].map((data) => ({ type: "space", data, spaceType: "lastVisited" }));

export const subscribedSpaces: TSpaceListItem[] = [
  {
    icon: "🍺",
    lastActivity: {
      sender: "nicknick",
      message: "I'm back home",
    },
    name: "Thule32",
    themeColorHexaCode: "#69701e",
  },
].map((data) => ({ type: "space", data, spaceType: "subscribed" }));
