import { useContext } from "react";
import { LastUpdatedContxtContext } from "../components/context/LastUpdatedContext";

export const useLastUpdated = () => useContext(LastUpdatedContxtContext);
