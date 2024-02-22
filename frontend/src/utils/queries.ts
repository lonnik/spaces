import { Address, Location, Space, Uuid, UserUid } from "../types";
import { fetchApi } from "./fetch_api";
import { parseQuery } from "./parse_query";

const radius = 500;

export const getSpacesByLocation = async (loc: Location) => {
  const locationParamValue = `${loc.longitude},${loc.latitude}`;
  const queryStr = parseQuery({ location: locationParamValue, radius });

  return fetchApi<Space[]>(`/spaces${queryStr}`);
};

export const getSpaceById = async (spaceId: Uuid) => {
  return fetchApi<Space>(`/spaces/${encodeURIComponent(spaceId)}`);
};

export const getAddress = async (loc: Location) => {
  const locationParamValue = `${loc.longitude},${loc.latitude}`;
  const queryStr = parseQuery({ location: locationParamValue });

  return fetchApi<Address>(`/address${queryStr}`);
};

type SpaceParams = {
  name: string;
  themeColorHexaCode: string;
  radius: number;
  location: Location;
};

export const createSpace = async (spaceParams: SpaceParams) => {
  return fetchApi<{ spaceId: Uuid }>("/spaces", {
    method: "POST",
    body: JSON.stringify(spaceParams),
  });
};

export const createToplevelThread = async (spaceId: Uuid, content: string) => {
  return fetchApi<{ threadId: UserUid }>(
    `/spaces/${encodeURIComponent(spaceId)}/toplevel-threads`,
    { method: "POST", body: JSON.stringify({ content, type: "text" }) }
  );
};
