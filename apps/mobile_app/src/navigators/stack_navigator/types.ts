import { JSX } from "react";

// Supported screen options
export type TabNavigationOptions = {
  animation?: "slideInFromRight" | "slideInFromBottom";
  snapPoint?: string;
};

// Map of event name and the type of data (in event.data)
//
// canPreventDefault: true adds the defaultPrevented property to the
// emitted events.
export type TabNavigationEventMap = {
  tabPress: {
    data: { isAlreadyFocused: boolean };
    canPreventDefault: true;
  };
};
