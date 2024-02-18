import { FC, ReactElement, createContext, useContext, useState } from "react";
import { NotificationType } from "../../types";

type NotificationState = {
  type: NotificationType;
  title: string;
  description: string;
};

const NotificationStateContext = createContext<null | NotificationState>(null);
const NotificationSetStateContext = createContext<
  React.Dispatch<React.SetStateAction<NotificationState | null>>
>(() => {});

export const NotificationStateProvider: FC<{ children: ReactElement }> = ({
  children,
}) => {
  const [state, setState] = useState<NotificationState | null>(null);

  return (
    <NotificationStateContext.Provider value={state}>
      <NotificationSetStateContext.Provider value={setState}>
        {children}
      </NotificationSetStateContext.Provider>
    </NotificationStateContext.Provider>
  );
};

export const useNotificationState = () => {
  const state = useContext(NotificationStateContext);
  const setState = useContext(NotificationSetStateContext);

  return [state, setState] as const;
};
