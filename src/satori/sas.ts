import { Channel } from "./protocol"

export interface ListParam {
  next?: string
}

export interface MessageListParams extends ListParam {
  channel_id: string
}
export interface LoginParams {
  config: any
  platform: string
}

export interface Contact {
  id: string
  name: string
  platform: string
  whoIsHere: string[]
  type: Contact.Type
  avatar?: string
  coverUserName?: string
  coverUserNick?: string
  coverUserId?: string
  coverMessage?: string
  updateTime?: string
  parent?: string | undefined
  children?: string[] | undefined
}


export namespace Contact {
  export enum Type {
    TEXT,
    DIRECT,
    CATEGORY,
    VOICE,
    GUILD,
  }

  export const TypeMap: Map<Channel.Type, Type> = new Map([
    [Channel.Type.TEXT, Type.TEXT],
    [Channel.Type.DIRECT, Type.DIRECT],
    [Channel.Type.CATEGORY, Type.CATEGORY],
    [Channel.Type.VOICE, Type.VOICE],
  ])
}

export interface ApiConfig {
  enabled?: boolean
}

export interface WebSocketConfig {
  enabled?: boolean
  resumeTimeout?: number
}

export interface Webhook {
  enabled?: boolean
  endpoint: string
  token?: string
}

export interface Config {
  path: string
  token?: string
  api?: ApiConfig
  websocket?: WebSocketConfig
  webhooks: Webhook[]
}
