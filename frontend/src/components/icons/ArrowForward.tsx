import Svg, { SvgProps, Path } from "react-native-svg";

export const ArrowForward = (props: SvgProps) => (
  <Svg viewBox="0 0 20 16" fill="none" {...props}>
    <Path
      fill={props.fill || "#666"}
      d="M19.707 8.707a1 1 0 0 0 0-1.414L13.343.929a1 1 0 1 0-1.414 1.414L17.586 8l-5.657 5.657a1 1 0 0 0 1.414 1.414l6.364-6.364ZM0 9h19V7H0v2Z"
    />
  </Svg>
);
