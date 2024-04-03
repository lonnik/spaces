import { useContext } from "react";
import {
  UserDispatchContext,
  UserStateContext,
} from "../components/context/UserContext";

export const useUserState = () => {
  const context = useContext(UserStateContext);
  const dispatch = useContext(UserDispatchContext);

  if (context === null || dispatch === null) {
    throw new Error("useUserState must be used within a UserStateProvider");
  }

  return [context, dispatch] as const;
};
