export type UserUid = string;
export type Uuid = string;

export type RootStackParamList = {
  Profile: undefined;
  MainTabs: undefined;
  SignIn: undefined;
  Space: {
    spaceId: Uuid;
  };
  NewSpace: undefined;
  LastVisitedSpaces: undefined;
};

export type SpaceStackParamList = {
  Overview: undefined;
  Info: undefined;
  Subscribers: undefined;
  Share: undefined;
  Thread: {
    spaceId: Uuid;
    threadId?: Uuid;
    parentThreadId: Uuid;
    parentMessageId: Uuid;
  };
  Answer: {
    spaceId: Uuid;
    threadId?: Uuid;
    parentThreadId: Uuid;
    parentMessageId: Uuid;
  };
};

export type TabsParamList = {
  Here: undefined;
  MySpaces: undefined;
  NewSpace: undefined;
};

export type Location = {
  latitude: number;
  longitude: number;
};

export type Space = {
  id: Uuid;
  name: string;
  themeColorHexaCode: string;
  radius: number;
  location: Location;
  adminId: UserUid;
  createdAt: Date;
  distance: number;
  icon?: string;
};

export type Address = {
  city: string;
  country: string;
  formattedAddress: string;
  geoHash: string;
  postalCode: string;
  street: string;
  streetNumber: string;
};

export type TopLevelThread = Pick<
  Thread,
  "id" | "firstMessage" | "likes" | "messagesCount" | "createdAt" | "spaceId"
>;

export type Thread = {
  id: Uuid;
  firstMessage: Message; // only toplevel thread
  likes: number;
  messagesCount: number;
  createdAt: string;
  spaceId: Uuid;
  messages: Message[]; // only child thread
  parentMessageId: Uuid; // only child thread
};

export type Message = {
  id: Uuid;
  content: string;
  likesCount: number;
  type: MessageType;
  createdAt: string;
  senderId: Uuid;
  childThreadId: Uuid;
  threadId: Uuid;
  childThreadMessagesCount?: number; // only child thread
};

export type User = {
  id: UserUid;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  isSignedUp: boolean;
};

export type MessageType = "text";

export type Sorting = "recent" | "popularity";

export type NotificationType = "error" | "success" | "loading" | "info";
