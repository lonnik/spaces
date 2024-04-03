import Svg, { SvgProps, Rect } from "react-native-svg";

export const MySpacesIcon = (props: SvgProps) => (
  <Svg width={25} height={25} fill="none" {...props}>
    <Rect
      width={8.523}
      height={9.943}
      x={1.136}
      y={1.136}
      fill={props.fill}
      strokeLinejoin="round"
      strokeWidth={2}
      rx={1}
    />
    <Rect
      width={8.523}
      height={7.102}
      x={1.136}
      y={16.761}
      fill={props.fill}
      strokeLinejoin="round"
      strokeWidth={2}
      rx={1}
    />
    <Rect
      width={8.523}
      height={7.102}
      x={15.341}
      y={1.136}
      fill={props.fill}
      strokeLinejoin="round"
      strokeWidth={2}
      rx={1}
    />
    <Rect
      width={8.523}
      height={9.943}
      x={15.341}
      y={13.921}
      fill={props.fill}
      strokeLinejoin="round"
      strokeWidth={2}
      rx={1}
    />
  </Svg>
);
