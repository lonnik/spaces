import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

export const WarningIcon = (props: SvgProps) => (
  <Svg viewBox="0 0 18 18" fill="none" {...props}>
    <Path
      fill={props.fill || "transparent"}
      fillRule="evenodd"
      d="M18 9A9 9 0 1 1 0 9a9 9 0 0 1 18 0ZM4.94 13.06a1.5 1.5 0 0 1 0-2.12L6.878 9l-1.94-1.94a1.5 1.5 0 1 1 2.122-2.12L9 6.878l1.94-1.94a1.5 1.5 0 0 1 2.12 2.122L11.122 9l1.94 1.94a1.5 1.5 0 0 1-2.122 2.12L9 11.122l-1.94 1.94a1.5 1.5 0 0 1-2.12 0Z"
      clipRule="evenodd"
    />
  </Svg>
);
