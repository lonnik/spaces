import { User } from "firebase/auth";
import {
  FC,
  createContext,
  ReactElement,
  useReducer,
  Dispatch,
  useContext,
} from "react";
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

const UserStateContext = createContext<null | UserState>(null);
const UserDispatchContext = createContext<null | Dispatch<Action>>(null);

export const UserStateProvider: FC<{ children: ReactElement }> = ({
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

export const useUserState = () => {
  const context = useContext(UserStateContext);
  const dispatch = useContext(UserDispatchContext);

  if (context === null || dispatch === null) {
    throw new Error("useUserState must be used within a UserStateProvider");
  }

  return [context, dispatch] as const;
};
