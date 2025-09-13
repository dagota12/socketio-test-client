

export interface Message {
  id: string;
  timestamp: string;
  data: any;
}

export type MessagesByEvent = Record<string, Message[]>;

export interface ConnectionProfile {
  id: string;
  name: string;
  url: string;
  token: string;
  listeners: string[];
  messages: MessagesByEvent;
  draftEventName: string;
  draftEventPayload: string;
}
