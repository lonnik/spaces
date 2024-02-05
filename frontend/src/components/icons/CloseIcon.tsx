import Svg, { SvgProps, Circle, Path } from "react-native-svg";

export const CloseIcon = (props: SvgProps) => (
  <Svg width={24} height={24} fill="none" {...props}>
    <Circle cx={12} cy={12} r={12} fill={props.fill} />
    <Path
      stroke="#222"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.2}
      d="M17 7 7 17M7 7l10 10"
    />
  </Svg>
);
