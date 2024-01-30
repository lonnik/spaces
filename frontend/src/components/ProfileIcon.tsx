import Svg, { SvgProps, Ellipse, Path } from "react-native-svg";

export const ProfileIcon = (props: SvgProps) => (
  <Svg width={28} height={29} fill="none" {...props}>
    <Ellipse cx={14.05} cy={11.266} fillOpacity={0.72} rx={5.007} ry={5.563} />
    <Path
      fillOpacity={0.72}
      fillRule="evenodd"
      d="M2.113 14.048C2.113 7.453 7.438 2.113 14 2.113s11.887 5.34 11.887 11.935c0 2.947-1.064 5.645-2.827 7.726-2.26-1.665-5.615-2.72-9.359-2.72-3.54 0-6.732.944-8.98 2.454a11.913 11.913 0 0 1-2.608-7.46ZM14 .113C6.327.113.113 6.355.113 14.048.113 21.74 6.327 27.983 14 27.983s13.887-6.243 13.887-13.935C27.887 6.355 21.673.113 14 .113Z"
      clipRule="evenodd"
    />
  </Svg>
);
