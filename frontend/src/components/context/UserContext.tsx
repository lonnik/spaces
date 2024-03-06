import { User } from "firebase/auth";
import { FC, createContext, useReducer, Dispatch, ReactNode } from "react";
import { Location } from "../../types";

const initialState: {
  user?: User;
  userIsLoading: boolean;
  location?: Location;
} = {
  user: undefined,
  userIsLoading: true,
};

type UserState = typeof initialState;
type Action =
  | { type: "SIGN_IN"; user: User }
  | { type: "SIGN_OUT" }
  | { type: "SET_LOCATION"; location: Location };

const userReducer = (prevState: UserState, action: Action) => {
  switch (action.type) {
    case "SIGN_IN": {
      return { ...prevState, user: action.user, userIsLoading: false };
    }
    case "SIGN_OUT": {
      return { ...prevState, user: undefined, userIsLoading: false };
    }
    case "SET_LOCATION": {
      return { ...prevState, location: action.location };
    }
    default:
      return prevState;
  }
};

export const UserStateContext = createContext<null | UserState>(null);
export const UserDispatchContext = createContext<null | Dispatch<Action>>(null);

export const UserStateProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  return (
    <UserStateContext.Provider value={state}>
      <UserDispatchContext.Provider value={dispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
};
