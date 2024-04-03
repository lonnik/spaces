import { forwardRef } from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

export const Heart2Icon = forwardRef<Svg, SvgProps>((props: SvgProps, ref) => (
  <Svg viewBox="0 0 20 18" fill="none" {...props} ref={ref}>
    <Path
      fill={props.fill || "none"}
      stroke={props.stroke || "#292D32"}
      strokeWidth={props.strokeWidth || 2}
      d="m9.2 2.829.8 1.07.8-1.07A4.549 4.549 0 0 1 14.44 1C16.953 1 19 3.048 19 5.59a9.68 9.68 0 0 1-.471 3.002l-.003.007c-.718 2.273-2.197 4.123-3.816 5.515-1.625 1.396-3.334 2.282-4.412 2.65l-.01.003c-.03.01-.135.033-.288.033-.154 0-.257-.023-.287-.033l-.01-.004c-1.079-.367-2.788-1.253-4.412-2.649-1.62-1.392-3.1-3.242-3.817-5.515l-.003-.007A9.679 9.679 0 0 1 1 5.59C1 3.048 3.047 1 5.56 1c1.48 0 2.81.72 3.64 1.829Z"
    />
  </Svg>
));
