import { useContext } from "react";
import { LastUpdatedContext } from "../components/context/LastUpdatedContext";

export const useLastUpdated = () => useContext(LastUpdatedContext);
