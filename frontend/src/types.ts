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
};

export type SpaceStackParamList = {
  Overview: undefined;
  Info: undefined;
  Share: undefined;
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

export type Thread = {
  id: Uuid;
  firstMessage?: Message; // only toplevel thread
  likes: number;
  messagesCount: number;
  createdAt: Date;
  spaceId: Uuid;
  messages?: Message[]; // only child thread
  parentMessageId?: Uuid; // only child thread
};

export type Message = {
  id: Uuid;
  content: string;
  likesCount: number;
  type: MessageType;
  createdAt: Date;
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
