import {
  Address,
  Location,
  Space,
  Uuid,
  UserUid,
  User,
  Sorting,
  Thread,
  Message,
  TopLevelThread,
} from "../types";
import { fetchApi } from "./fetch_api";
import { parseQuery } from "./parse_query";

const radius = 500;

// ----------------------------- GET --------------------------------

export const getSpacesByLocation = async (
  loc: Location,
  count: number | undefined = 10,
  offset: number | undefined = 0
) => {
  const locationParamValue = `${loc.longitude},${loc.latitude}`;
  const queryStr = parseQuery({
    location: locationParamValue,
    radius,
    count,
    offset,
  });
  const url = `/spaces${queryStr}`;

  return fetchApi<Space[]>(url);
};

export const getSpaceById = async (spaceId: Uuid) => {
  const url = `/spaces/${encodeURIComponent(spaceId)}`;

  return fetchApi<Space>(url);
};

export const getAddress = async (loc: Location) => {
  const locationParamValue = `${loc.longitude},${loc.latitude}`;
  const queryStr = parseQuery({ location: locationParamValue });
  const url = `/address${queryStr}`;

  return fetchApi<Address>(url);
};

export const getToplevelThreads = async (
  spaceId: Uuid,
  offset: number | undefined = 0,
  count: number | undefined = 10
) => {
  const queryStr = parseQuery({ sort: "recent", offset, count });
  const url = `/spaces/${encodeURIComponent(
    spaceId
  )}/toplevel-threads${queryStr}`;

  return fetchApi<TopLevelThread[]>(url);
};

export const getThreadWithMessages = async (
  spaceId: Uuid,
  threadId: Uuid,
  sorting: Sorting,
  count: number,
  offset: number
) => {
  const queryStr = parseQuery({
    sort: sorting,
    messages_offset: offset,
    messages_count: count,
  });

  const url = `/spaces/${encodeURIComponent(
    spaceId
  )}/threads/${encodeURIComponent(threadId)}${queryStr}`;

  return fetchApi<Thread>(url);
};

export const getMessage = async (
  spaceId: Uuid,
  threadId: Uuid,
  messageId: Uuid
) => {
  const url = `/spaces/${spaceId}/threads/${threadId}/messages/${messageId}`;

  return fetchApi<Message>(url);
};

export const getUser = async (userId: UserUid) => {
  const url = `/users/${encodeURIComponent(userId)}`;

  return fetchApi<User>(url);
};

export const getSpaceSubscribers = async (
  spaceId: Uuid,
  active: boolean,
  offset: number,
  count: number
) => {
  const queryStr = parseQuery({ offset, count, active });

  const url = `/spaces/${encodeURIComponent(spaceId)}/subscribers${queryStr}`;
  return fetchApi<User[]>(url);
};

// ------------------ CREATE -----------------------

export const createMessageLike = async (
  spaceId: Uuid,
  threadId: Uuid,
  messageId: Uuid
) => {
  const url = `/spaces/${encodeURIComponent(
    spaceId
  )}/threads/${encodeURIComponent(threadId)}/messages/${encodeURIComponent(
    messageId
  )}/likes`;

  return fetchApi<"success">(url, { method: "POST" });
};

type SpaceParams = {
  name: string;
  themeColorHexaCode: string;
  radius: number;
  location: Location;
};

export const createSpace = async (spaceParams: SpaceParams) => {
  const url = "/spaces";

  return fetchApi<{ spaceId: Uuid }>(url, {
    method: "POST",
    body: JSON.stringify(spaceParams),
  });
};

export const createSpaceSubscriber = async (spaceId: Uuid) => {
  const url = `/spaces/${encodeURIComponent(spaceId)}/subscribers`;

  return fetchApi<"success">(url, { method: "POST" });
};

export const createToplevelThread = async (spaceId: Uuid, content: string) => {
  const url = `/spaces/${encodeURIComponent(spaceId)}/toplevel-threads`;

  return fetchApi<{ threadId: Uuid; firstMessageId: Uuid }>(url, {
    method: "POST",
    body: JSON.stringify({ content, type: "text" }),
  });
};

export const createThread = async (
  spaceId: Uuid,
  threadId: Uuid,
  messageId: Uuid
) => {
  const url = `/spaces/${encodeURIComponent(
    spaceId
  )}/threads/${encodeURIComponent(threadId)}/messages/${encodeURIComponent(
    messageId
  )}/threads`;

  return fetchApi<{ threadId: Uuid }>(url, { method: "POST" });
};

export const createMessage = async (
  spaceId: Uuid,
  threadId: Uuid,
  content: string
) => {
  const url = `/spaces/${spaceId}/threads/${threadId}/messages`;

  return fetchApi<{ messageId: Uuid }>(url, {
    method: "POST",
    body: JSON.stringify({ content, type: "text" }),
  });
};
