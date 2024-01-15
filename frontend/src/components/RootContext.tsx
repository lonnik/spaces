import { User } from "firebase/auth";
import { FC, createContext, ReactElement, useReducer, Dispatch } from "react";

const initialState: { user?: User; userIsLoading: boolean } = {
  user: undefined,
  userIsLoading: true,
};

type RootState = typeof initialState;
type Action = { type: "SIGN_IN"; user: User } | { type: "SIGN_OUT" };

const rootReducer = (prevState: RootState, action: Action) => {
  switch (action.type) {
    case "SIGN_IN": {
      return { ...prevState, user: action.user, userIsLoading: false };
    }
    case "SIGN_OUT": {
      return { ...prevState, user: undefined, userIsLoading: false };
    }
    default:
      return prevState;
  }
};

export const RootStateContext = createContext<null | RootState>(null);
export const RootDispatchContext = createContext<null | Dispatch<Action>>(null);

export const RootStateProvider: FC<{ children: ReactElement }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(rootReducer, initialState);

  return (
    <RootStateContext.Provider value={state}>
      <RootDispatchContext.Provider value={dispatch}>
        {children}
      </RootDispatchContext.Provider>
    </RootStateContext.Provider>
  );
};
