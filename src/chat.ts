import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { ChatSpace, ChatMessage } from "./types.js";

function getChatClient(auth: OAuth2Client) {
  return google.chat({ version: "v1", auth });
}

export async function listSpaces(
  auth: OAuth2Client,
  params: {
    pageSize?: number;
    filter?: string;
    pageToken?: string;
  }
): Promise<{ spaces: ChatSpace[]; nextPageToken?: string | null }> {
  const chat = getChatClient(auth);
  const res = await chat.spaces.list({
    pageSize: params.pageSize,
    filter: params.filter,
    pageToken: params.pageToken,
  });
  return {
    spaces: (res.data.spaces ?? []) as ChatSpace[],
    nextPageToken: res.data.nextPageToken,
  };
}

export async function listMessages(
  auth: OAuth2Client,
  params: {
    spaceName: string;
    pageSize?: number;
    filter?: string;
    orderBy?: string;
    showDeleted?: boolean;
    pageToken?: string;
  }
): Promise<{ messages: ChatMessage[]; nextPageToken?: string | null }> {
  const chat = getChatClient(auth);
  const res = await chat.spaces.messages.list({
    parent: params.spaceName,
    pageSize: params.pageSize,
    filter: params.filter,
    orderBy: params.orderBy,
    showDeleted: params.showDeleted,
    pageToken: params.pageToken,
  });
  return {
    messages: (res.data.messages ?? []) as ChatMessage[],
    nextPageToken: res.data.nextPageToken,
  };
}

export async function sendMessage(
  auth: OAuth2Client,
  params: {
    spaceName: string;
    text: string;
    threadName?: string;
  }
): Promise<ChatMessage> {
  const chat = getChatClient(auth);
  const requestBody: {
    text: string;
    thread?: { name: string };
  } = { text: params.text };

  if (params.threadName) {
    requestBody.thread = { name: params.threadName };
  }

  const res = await chat.spaces.messages.create({
    parent: params.spaceName,
    requestBody,
    ...(params.threadName ? { messageReplyOption: "REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD" } : {}),
  });
  return res.data as ChatMessage;
}

export async function getMessage(
  auth: OAuth2Client,
  params: {
    messageName: string;
  }
): Promise<ChatMessage> {
  const chat = getChatClient(auth);
  const res = await chat.spaces.messages.get({ name: params.messageName });
  return res.data as ChatMessage;
}

export async function searchMessages(
  auth: OAuth2Client,
  params: {
    spaceName: string;
    query: string;
    afterTime?: string;
    pageSize?: number;
  }
): Promise<ChatMessage[]> {
  const chat = getChatClient(auth);

  const filterParts: string[] = [];
  if (params.afterTime) {
    filterParts.push(`createTime > "${params.afterTime}"`);
  }

  const res = await chat.spaces.messages.list({
    parent: params.spaceName,
    pageSize: params.pageSize ?? 100,
    filter: filterParts.length > 0 ? filterParts.join(" AND ") : undefined,
    orderBy: "createTime desc",
  });

  const messages = (res.data.messages ?? []) as ChatMessage[];
  const lowerQuery = params.query.toLowerCase();

  return messages.filter((msg) => {
    const text = (msg.text ?? msg.formattedText ?? "").toLowerCase();
    return text.includes(lowerQuery);
  });
}
