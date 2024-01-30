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
