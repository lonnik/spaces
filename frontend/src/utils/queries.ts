import { Address, Location, Space, Uuid } from "../types";
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
