import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

export const CommentIcon = (props: SvgProps) => (
  <Svg fill="none" {...props} viewBox="0 0 600 600">
    <Path
      stroke={props.stroke || "#000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={props.strokeWidth || 50}
      d="M293 560.834c146.815 0 265.834-119.019 265.834-265.834 0-146.816-119.019-265.833-265.834-265.833C146.184 29.167 27.167 148.184 27.167 295c0 70.792 27.671 135.121 72.788 182.761l-53.467 61.022c-7.529 8.591-1.427 22.051 9.997 22.051H293Z"
    />
  </Svg>
);
