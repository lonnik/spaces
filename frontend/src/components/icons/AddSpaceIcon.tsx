import * as React from "react";
import Svg, { SvgProps, Circle, Path } from "react-native-svg";

export const AddSpaceIcon = (props: SvgProps) => (
  <Svg width={27} height={27} fill="none" {...props}>
    <Circle
      cx={13.5}
      cy={13.5}
      r={12.5}
      stroke={props.stroke}
      strokeOpacity={0.72}
      strokeWidth={2}
    />
    <Path
      stroke={props.stroke}
      strokeLinecap="square"
      strokeOpacity={0.72}
      strokeWidth={2}
      d="M13.5 18.63V8.38M18.63 13.5H8.38"
    />
  </Svg>
);
