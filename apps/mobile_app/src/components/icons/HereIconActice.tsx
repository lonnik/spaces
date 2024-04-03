import * as React from "react";
import Svg, { SvgProps, Path, Circle } from "react-native-svg";

export const HereIconActive = (props: SvgProps) => (
  <Svg viewBox="0 0 23 27" fill="none" {...props}>
    <Path
      fill="#444"
      stroke="#444"
      strokeWidth={2}
      d="M21.708 12.042c0 7.536-7.923 11.98-9.809 12.932a.877.877 0 0 1-.798 0c-1.886-.951-9.81-5.396-9.81-12.932 0-5.638 4.571-10.209 10.209-10.209s10.208 4.57 10.208 10.209Z"
    />
    <Circle
      cx={11.5}
      cy={12.042}
      r={5.375}
      fill="#fff"
      stroke="#444"
      strokeWidth={2}
    />
  </Svg>
);
