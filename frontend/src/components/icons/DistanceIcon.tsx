import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

export const DistanceIcon = (props: SvgProps) => (
  <Svg viewBox="0 0 12 7" fill="none" {...props}>
    <Path
      fill={props.fill || "#666"}
      d="m.14 3.836 3.024 3.025a.475.475 0 0 0 .672-.672L1.623 3.975H9.61L7.396 6.19a.475.475 0 0 0 .672.672l3.025-3.025a.475.475 0 0 0 0-.672L8.068.139a.475.475 0 0 0-.672.672L9.61 3.025H1.623L3.836.81A.475.475 0 0 0 3.164.14L.139 3.164a.475.475 0 0 0 0 .672Z"
    />
  </Svg>
);
