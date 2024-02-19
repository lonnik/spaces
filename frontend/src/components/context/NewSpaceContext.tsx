import {
  FC,
  createContext,
  useReducer,
  Dispatch,
  useContext,
  ReactNode,
} from "react";

const initialState = {
  radius: 20,
  name: "",
  selectedColorIndex: 0,
};

type NewSpaceState = typeof initialState;
type Action =
  | { type: "SET_RADIUS"; newRadius: number }
  | { type: "SET_NAME"; newName: string }
  | { type: "SELECT_COLOR_INDEX"; newIndex: number };

const newSpaceStateReducer = (
  prevState: NewSpaceState,
  action: Action
): NewSpaceState => {
  switch (action.type) {
    case "SET_RADIUS": {
      return { ...prevState, radius: action.newRadius };
    }
    case "SET_NAME": {
      return { ...prevState, name: action.newName };
    }
    case "SELECT_COLOR_INDEX": {
      return { ...prevState, selectedColorIndex: action.newIndex };
    }
    default:
      return prevState;
  }
};

const NewSpaceStateContext = createContext<null | NewSpaceState>(null);
const NewSpaceStateDispatchContext = createContext<null | Dispatch<Action>>(
  null
);

export const NewSpaceStateProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(newSpaceStateReducer, initialState);

  return (
    <NewSpaceStateContext.Provider value={state}>
      <NewSpaceStateDispatchContext.Provider value={dispatch}>
        {children}
      </NewSpaceStateDispatchContext.Provider>
    </NewSpaceStateContext.Provider>
  );
};

export const useNewSpaceState = () => {
  const state = useContext(NewSpaceStateContext);
  const dispatch = useContext(NewSpaceStateDispatchContext);

  if (!state || !dispatch) {
    throw new Error(
      "useNewSpaceState must be used within a NewSpaceStateProvider"
    );
  }
  return [state, dispatch] as const;
};
