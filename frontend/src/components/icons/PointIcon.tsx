import Svg, { SvgProps, Circle } from "react-native-svg";

export const PointIcon = (props: SvgProps) => (
  <Svg fill="none" viewBox="0 0 2 2" {...props}>
    <Circle cx={1} cy={1} r={1} fill={props.fill || "#000"} />
  </Svg>
);
