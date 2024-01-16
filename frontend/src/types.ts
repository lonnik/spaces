type UserUid = string;
type Uuid = string;

export type RootStackParamList = {
  Profile: undefined;
  MainTabs: undefined;
  SignIn: undefined;
};

export type TabsParamList = {
  Here: undefined;
  MySpaces: undefined;
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
