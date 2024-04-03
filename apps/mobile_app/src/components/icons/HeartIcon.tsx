import { forwardRef } from "react";
import Svg, { SvgProps, G, Path, Defs, ClipPath } from "react-native-svg";

export const HeartIcon = forwardRef<Svg, SvgProps>((props: SvgProps, ref) => (
  <Svg fill="none" {...props} viewBox="0 0 590 590" ref={ref}>
    <G clipPath="url(#a)">
      <Path
        fill={props.fill || "currentColor"}
        d="M427.025 50C493.8 50.775 550 119.15 550 200c0 127.65-161.75 274.225-250.025 339.825C211.65 474.35 50 328 50 200c0-80.85 56.2-149.225 122.95-150 66.7 4.375 75.2 20.025 127.05 71.975C351.725 70.15 360.45 54.325 427.025 50ZM422.775.15 422.8 0C374.825 0 331.475 19.625 300 51.2 268.525 19.625 225.175 0 177.2 0l.025.15C76.1-1.6 0 92.975 0 200c0 200 298.45 400 298.45 400h3.1S600 400 600 200C600 92.825 523.775-1.6 422.775.15Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h600v600H0z" />
      </ClipPath>
    </Defs>
  </Svg>
));
