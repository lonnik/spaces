import { template } from "../../styles/template";
import { TSpaceListItem } from "./types";

export const lastVisitedSpaces: TSpaceListItem[] = [
  {
    icon: "🏠",
    lastActivity: {
      sender: "luka",
      message: "Get ready for the party",
    },
    name: "Thule45",
    themeColorHexaCode: template.colors.purple,
  },
  {
    icon: "🏓",
    lastActivity: {
      sender: "luka",
      message: "Have you seen my ping..",
    },
    name: "Pingpongparkparty",
    themeColorHexaCode: "#212078",
  },
  {
    icon: "🍺",
    lastActivity: {
      sender: "pia",
      message: "Let's meet here",
    },
    name: "beer garden",
    themeColorHexaCode: "#69701e",
  },
].map((data) => ({ type: "space", data, spaceType: "lastVisited" }));

export const subscribedSpaces: TSpaceListItem[] = [
  {
    icon: "🍺",
    lastActivity: {
      sender: "niko",
      message: "I'm back home",
    },
    name: "Thule32",
    themeColorHexaCode: "#69701e",
  },
].map((data) => ({ type: "space", data, spaceType: "subscribed" }));
