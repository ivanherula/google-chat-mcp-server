export interface StoredTokens {
  access_token?: string | null;
  refresh_token?: string | null;
  expiry_date?: number | null;
  token_type?: string | null;
  id_token?: string | null;
  scope?: string;
}

export interface ChatSpace {
  name?: string | null;
  displayName?: string | null;
  spaceType?: string | null;
  singleUserBotDm?: boolean | null;
  spaceThreadingState?: string | null;
  membershipCount?: {
    joinedDirectHumanUserCount?: number | null;
    joinedGroupCount?: number | null;
  } | null;
}

export interface ChatMessage {
  name?: string | null;
  sender?: {
    name?: string | null;
    displayName?: string | null;
    type?: string | null;
  } | null;
  createTime?: string | null;
  lastUpdateTime?: string | null;
  text?: string | null;
  formattedText?: string | null;
  thread?: {
    name?: string | null;
  } | null;
  space?: {
    name?: string | null;
  } | null;
  deleted?: boolean | null;
}
