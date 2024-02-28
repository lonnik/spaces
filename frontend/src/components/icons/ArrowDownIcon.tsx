import Svg, { SvgProps, G, Path, Defs, ClipPath } from "react-native-svg";

export const ArrowDownIcon = (props: SvgProps) => (
  <Svg viewBox="0 0 70 45" fill="none" {...props}>
    <G
      stroke={props.stroke || "black"}
      strokeLinecap="round"
      strokeWidth={props.strokeWidth || 10}
      clipPath="url(#a)"
    >
      <Path d="M35 35 60.456 9.544M35 35 9.544 9.544" />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h70v45H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
