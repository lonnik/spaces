import Svg, { SvgProps, Circle } from "react-native-svg";

export const PointIcon = (props: SvgProps & { size: number }) => (
  <Svg
    fill="none"
    viewBox="0 0 2 2"
    {...props}
    style={[props.style, { width: props.size, height: props.size }]}
  >
    <Circle cx={1} cy={1} r={1} fill={props.fill || "#000"} />
  </Svg>
);
