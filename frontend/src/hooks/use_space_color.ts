import { useContext } from "react";
import { SpaceColorContext } from "../components/context/SpaceColorContext";

export const useSpaceColor = () => useContext(SpaceColorContext);
