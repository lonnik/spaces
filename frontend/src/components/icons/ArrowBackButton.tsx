import * as React from "react";
import Svg, { SvgProps, G, Path, Defs, ClipPath } from "react-native-svg";

export const ArrowBackButton = (props: SvgProps) => (
  <Svg viewBox="0 0 45 70" fill="none" {...props}>
    <G
      stroke={props.stroke || "#000"}
      strokeLinecap="round"
      strokeWidth={props.strokeWidth || 10}
      clipPath="url(#a)"
    >
      <Path d="M10.044 34.956 35.5 60.412M10.044 34.956 35.5 9.5" />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h45v70H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
