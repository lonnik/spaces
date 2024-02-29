import { Space } from "../../types";

type Activity = {
  sender: string;
  message: string;
};

export type TSpaceListItem = {
  type: "space";
  data: Pick<Space, "icon" | "themeColorHexaCode" | "name"> & {
    lastActivity: Activity;
  };
  spaceType: "lastVisited" | "subscribed";
};

export type HeadingListItem = {
  type: "heading";
  heading: string;
};

export type EmptyStateListItem = {
  type: "empty";
  message: string;
};

export type ButtonListItem = {
  type: "button";
  text: string;
  onPress: () => void;
};

export type ListItem =
  | TSpaceListItem
  | HeadingListItem
  | EmptyStateListItem
  | ButtonListItem;
