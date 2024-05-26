import { Alert } from 'react-native'
import { ConnectionInfo } from './connection'
import Element from './element'
import { Dict } from 'cosmokit'
// import { Contact } from './sas'

export interface SendOptions {
    linkPreview?: boolean
}

export interface Field {
    name: string
}

function Field(name: string): Field {
    return { name }
}

export interface Method {
    name: string
    fields: Field[]
}

function Method(name: string, fields: string[]): Method {
    return { name, fields: fields.map(Field) }
}

export const Methods: Dict<Method> = {
    'channel.get': Method('getChannel', ['channel_id', 'guild_id']),
    'channel.list': Method('getChannelList', ['guild_id', 'next']),
    'channel.create': Method('createChannel', ['guild_id', 'data']),
    'channel.update': Method('updateChannel', ['channel_id', 'data']),
    'channel.delete': Method('deleteChannel', ['channel_id']),
    'channel.mute': Method('muteChannel', ['channel_id', 'guild_id', 'enable']),

    'message.create': Method('createMessage', ['channel_id', 'content']),
    'message.update': Method('editMessage', ['channel_id', 'message_id', 'content']),
    'message.delete': Method('deleteMessage', ['channel_id', 'message_id']),
    'message.get': Method('getMessage', ['channel_id', 'message_id']),
    'message.list': Method('getMessageList', ['channel_id', 'next', 'direction', 'limit', 'order']),

    'reaction.create': Method('createReaction', ['channel_id', 'message_id', 'emoji']),
    'reaction.delete': Method('deleteReaction', ['channel_id', 'message_id', 'emoji', 'user_id']),
    'reaction.clear': Method('clearReaction', ['channel_id', 'message_id', 'emoji']),
    'reaction.list': Method('getReactionList', ['channel_id', 'message_id', 'emoji', 'next']),

    'guild.get': Method('getGuild', ['guild_id']),
    'guild.list': Method('getGuildList', ['next']),

    'guild.member.get': Method('getGuildMember', ['guild_id', 'user_id']),
    'guild.member.list': Method('getGuildMemberList', ['guild_id', 'next']),
    'guild.member.kick': Method('kickGuildMember', ['guild_id', 'user_id', 'permanent']),
    'guild.member.mute': Method('muteGuildMember', ['guild_id', 'user_id', 'duration', 'reason']),
    'guild.member.role.set': Method('setGuildMemberRole', ['guild_id', 'user_id', 'role_id']),
    'guild.member.role.unset': Method('unsetGuildMemberRole', ['guild_id', 'user_id', 'role_id']),

    'guild.role.list': Method('getGuildRoleList', ['guild_id', 'next']),
    'guild.role.create': Method('createGuildRole', ['guild_id', 'data']),
    'guild.role.update': Method('updateGuildRole', ['guild_id', 'role_id', 'data']),
    'guild.role.delete': Method('deleteGuildRole', ['guild_id', 'role_id']),

    'login.get': Method('getLogin', []),
    'user.get': Method('getUser', ['user_id']),
    'user.channel.create': Method('createDirectChannel', ['user_id', 'guild_id']),
    'friend.list': Method('getFriendList', ['next']),
    'friend.delete': Method('deleteFriend', ['user_id']),

    'friend.approve': Method('handleFriendRequest', ['message_id', 'approve', 'comment']),
    'guild.approve': Method('handleGuildRequest', ['message_id', 'approve', 'comment']),
    'guild.member.approve': Method('handleGuildMemberRequest', ['message_id', 'approve', 'comment']),
    // 'app/contact.get': Method('getContactList', []),
    // 'app/login.list': Method('getLoginList', ['next']),
    // 'app/login': Method('appLogin', ['platform', 'config']),
    // 'app/message.get': Method('getMessageListSAS', ['channel_id', 'message_id', 'direction']),
}

export interface List<T> {
    data: T[]
    next?: string
}

export interface BidiList<T> {
    data: T[]
    next?: string
    prev?: string
}

export interface Methods {
    // message
    createMessage(channelId: string, content: Element.Fragment, guildId?: string, options?: SendOptions): Promise<Message[]>
    sendMessage(channelId: string, content: Element.Fragment, guildId?: string, options?: SendOptions): Promise<string[]>
    sendPrivateMessage(userId: string, content: Element.Fragment, guildId?: string, options?: SendOptions): Promise<string[]>
    getMessage(channelId: string, messageId: string): Promise<Message>
    getMessageList(channelId: string, next?: string, direction?: 'before' | 'after' | 'around', limit?: number, order?: 'asc' | 'desc'): Promise<BidiList<Message>>
    editMessage(channelId: string, messageId: string, content: Element.Fragment): Promise<void>
    deleteMessage(channelId: string, messageId: string): Promise<void>

    // reaction
    createReaction(channelId: string, messageId: string, emoji: string): Promise<void>
    deleteReaction(channelId: string, messageId: string, emoji: string, userId?: string): Promise<void>
    clearReaction(channelId: string, messageId: string, emoji?: string): Promise<void>
    getReactionList(channelId: string, messageId: string, emoji: string, next?: string): Promise<List<User>>
    getReactionIter(channelId: string, messageId: string, emoji: string): AsyncIterable<User>

    // user
    getLogin(): Promise<Login>
    getUser(userId: string, guildId?: string): Promise<User>
    getFriendList(next?: string): Promise<List<User>>
    getFriendIter(): AsyncIterable<User>
    deleteFriend(userId: string): Promise<void>

    // guild
    getGuild(guildId: string): Promise<Guild>
    getGuildList(next?: string): Promise<List<Guild>>
    getGuildIter(): AsyncIterable<Guild>

    // guild member
    getGuildMember(guildId: string, userId: string): Promise<GuildMember>
    getGuildMemberList(guildId: string, next?: string): Promise<List<GuildMember>>
    getGuildMemberIter(guildId: string): AsyncIterable<GuildMember>
    kickGuildMember(guildId: string, userId: string, permanent?: boolean): Promise<void>
    muteGuildMember(guildId: string, userId: string, duration: number, reason?: string): Promise<void>

    // role
    setGuildMemberRole(guildId: string, userId: string, roleId: string): Promise<void>
    unsetGuildMemberRole(guildId: string, userId: string, roleId: string): Promise<void>
    getGuildRoleList(guildId: string, next?: string): Promise<List<GuildRole>>
    getGuildRoleIter(guildId: string): AsyncIterable<GuildRole>
    createGuildRole(guildId: string, data: Partial<GuildRole>): Promise<GuildRole>
    updateGuildRole(guildId: string, roleId: string, data: Partial<GuildRole>): Promise<void>
    deleteGuildRole(guildId: string, roleId: string): Promise<void>

    // channel
    getChannel(channelId: string, guildId?: string): Promise<Channel>
    getChannelList(guildId: string, next?: string): Promise<List<Channel>>
    getChannelIter(guildId: string): AsyncIterable<Channel>
    createDirectChannel(userId: string, guildId?: string): Promise<Channel>
    createChannel(guildId: string, data: Partial<Channel>): Promise<Channel>
    updateChannel(channelId: string, data: Partial<Channel>): Promise<void>
    deleteChannel(channelId: string): Promise<void>
    muteChannel(channelId: string, guildId?: string, enable?: boolean): Promise<void>

    // request
    handleFriendRequest(messageId: string, approve: boolean, comment?: string): Promise<void>
    handleGuildRequest(messageId: string, approve: boolean, comment?: string): Promise<void>
    handleGuildMemberRequest(messageId: string, approve: boolean, comment?: string): Promise<void>

    // commands
    updateCommands(commands: Command[]): Promise<void>

    // SAS
    // appLogin(platform: string, config: Dict): Promise<void>
    // getContactList(next?: string): Promise<Contact[]>
    // getLoginList(next?: string): Promise<List<Login>>
    // getMessageListSAS(channelId: string,
    //     messageId?: string,
    //     direction?: 'up' | 'down',
    // ): Promise<Message[]>
    // getLoginIter(): AsyncIterable<Login>
    // getContactIter(): AsyncIterable<User>
    // getMessagesIter(channelId: string): AsyncIterable<Message>
}

export const asyncIterToArr = async <T>(iter: AsyncIterable<T>) => {
    const arr = []
    for await (const v of iter) {
        arr.push(v)
    }
    return arr
}


/**
 * 200 (OK)	请求成功
400 (BAD REQUEST)	请求格式错误
401 (UNAUTHORIZED)	缺失鉴权
403 (FORBIDDEN)	权限不足
404 (NOT FOUND)	资源不存在
405 (METHOD NOT ALLOWED)	请求方法不支持
5XX (SERVER ERROR)	服务器错误
 */
const httpCodeTips = new Proxy({
    200: '请求成功',
    400: '请求格式错误',
    401: '鉴权失败',
    403: '权限不足',
    404: '资源不存在',
    405: '请求方法不支持',
}, {
    get: (target, key) => target[key] || (key.toString().startsWith('5') && '服务器错误') || '未知错误'
})

export const convertCamelToSnake = (str: string) => str.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)
export const convertSnakeToCamel = (str: string) => str.replace(/_./g, c => c[1].toUpperCase())

export const convertCamelObjectToSnake = (obj: object) => {
    if (obj === null || typeof obj !== 'object') {
        return obj
    }
    const newObj: Dict = {}
    for (const key in obj) {
        const res = convertCamelObjectToSnake(obj[key])
        newObj[convertCamelToSnake(key)] = res
        // newObj[key] = res
    }
    return newObj
}

export const convertSnakeObjectToCamel = (obj: object) => {
    if (obj === null || typeof obj !== 'object') {
        return obj
    }
    const newObj: Dict = obj instanceof Array ? [] : {}
    for (const key in obj) {
        const res = convertSnakeObjectToCamel(obj[key])
        newObj[convertSnakeToCamel(key)] = res
        newObj[key] = res
    }
    return newObj
}

// Convert {a: {0: x, 1: y}} to {a: [x, y]}
const fixArrays = (obj: object) => {
    if (obj === null || typeof obj !== 'object') {
        return obj
    }
    const isNumber = i => !Number.isNaN(parseInt(i))

    let notNum = false;
    for (const key in obj) {
        if (!isNumber(key)) {
            notNum = true;
            break;
        }
    }

    if (notNum) {
        for (const key in obj)
            obj[key] = fixArrays(obj[key])

        return obj
    } else {
        return Object.values(obj)
    }
}

class SatoriError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'SatoriError'
    }
}

const satoriError = (message: string) => {
    console.error('SatoriError:', message)
    throw new SatoriError(message)
}

/*
HTTP API
这是一套 HTTP RPC 风格的 API，所有 URL 的形式均为 /{path}/{version}/{resource}.{method}。其中，path 为部署路径 (可以为空)，version 为 API 的版本号，resource 是资源类型，method 为方法名。

目前 Satori 仅有 v1 一个版本。

所有 API 的请求都使用 POST，参数以 application/json 的形式编码在请求体中。返回值也是 JSON 格式。

请求头中需要包含 X-Platform 和 X-Self-ID 字段，分别表示平台名称和平台账号。

一个合法的请求示例形如：

text
POST /v1/channel.get
Content-Type: application/json
Authorization: Bearer 1234567890
X-Platform: discord
X-Self-ID: 1234567890

{"channel_id": "1234567890"}
 */

export type BotInfo = {
    platform: string
    selfId: string
} | {
    platform?: undefined
    selfId?: undefined
}

export const callMethodAsync = async (method: string, args: object, connectionInfo: ConnectionInfo, botInfo: BotInfo) => {
    // Verify fields
    const methodInfo = Methods[method]
    if (!methodInfo) {
        satoriError(`Unknown method ${method}`)
    }
    for (const key in args) {
        if (!methodInfo.fields.some(field => field.name === key)) {
            satoriError(`Redundant field ${key} in args`)
        }
    }

    // Make request
    const url = `${connectionInfo.https ? 'https' : 'http'}://${connectionInfo.server}/v1/${method}`
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${connectionInfo.token}`,
        'X-Platform': botInfo.platform ?? '',
        'X-Self-ID': botInfo.selfId ?? '',
    }
    const body = JSON.stringify(args)


    console.log('call satori', method)
    const res = await fetch(url, { method: 'POST', headers, body })
    if (!res.ok) {
        satoriError(`HTTP ${res.status}: ${res.statusText} (${httpCodeTips[res.status]})`)
    }
    const v = await res.text()
    try {
        console.log(method, '=> response', res.status, res.statusText)
        return convertSnakeObjectToCamel(JSON.parse(v))
    } catch (e) {
        satoriError(`Failed to parse response: ${v}`)
    }
}

export const createAPI = (connectionInfo: ConnectionInfo, botInfo: BotInfo): Methods => {
    const callMethod = (method: string, args: object) => callMethodAsync(method, args, connectionInfo, botInfo)

    const createMethod = (methodId: string) => {
        return (...args: any[]) => callMethod(methodId, Object.fromEntries(Methods[methodId].fields.map((field, i) => [field.name, args[i]])))
    }
    const methods = Object.entries(Methods).map(([id, method]) => [method.name, createMethod(id)])

    // impl xxxxxIter from xxxxxList
    const createIter = (methodId: string) => {
        const method = createMethod(methodId) as any
        return (...args: any) => {
            const res = (async function* () {
                let next: string | undefined = undefined
                while (true) {
                    const { data, next: nextNext } = await method(...args, next)
                    console.log('iter', data, next)
                    for (const v of data) {
                        yield v
                    }
                    if (!nextNext) {
                        break
                    }
                    next = nextNext
                }
            })()
            res[Symbol.asyncIterator] = () => res
            return res
        }
    }

    const iterMethods = Object.entries(Methods)
        .filter(([id]) => id.endsWith('.list'))
        .map(([id, method]) => [method.name.replace('List', 'Iter'), createIter(id)])

    return Object.fromEntries([...methods, ...iterMethods]) as any as Methods
}


export interface Channel {
    id: string
    type: Channel.Type
    name?: string
    parentId?: string
}

export namespace Channel {
    export const enum Type {
        TEXT = 0,
        DIRECT = 1,
        VOICE = 2,
        CATEGORY = 3,
    }
}

export interface Guild {
    id: string
    name?: string
    avatar?: string
}

export interface GuildRole {
    id: string
    name: string
    color: number
    position: number
    permissions: bigint
    hoist: boolean
    mentionable: boolean
}

export interface User {
    id: string
    name?: string
    nick?: string
    /** @deprecated */
    userId?: string
    /** @deprecated */
    username?: string
    /** @deprecated */
    nickname?: string
    avatar?: string
    discriminator?: string
    isBot?: boolean
}

export interface GuildMember {
    user?: User
    name?: string
    nick?: string
    avatar?: string
    title?: string
    roles?: string[]
    joinedAt?: number
}

export interface Login {
    user?: User
    platform: string
    selfId: string
    hidden?: boolean
    status: Status
}

export const enum Status {
    OFFLINE = 0,
    ONLINE = 1,
    CONNECT = 2,
    DISCONNECT = 3,
    RECONNECT = 4,
}

export interface Message {
    id?: string
    /** @deprecated */
    messageId?: string
    channel?: Channel
    guild?: Guild
    user?: User
    member?: GuildMember
    content?: string
    elements?: Element[]
    timestamp?: number
    quote?: Message
    createdAt?: number
    updatedAt?: number
}

export interface Button {
    id: string
}

export interface Command {
    name: string
    description: Dict<string>
    arguments: Command.Declaration[]
    options: Command.Declaration[]
    children: Command[]
}

export namespace Command {
    export interface Declaration {
        name: string
        description: Dict<string>
        type: string
        required: boolean
    }
}

export interface Argv {
    name: string
    arguments: any[]
    options: Dict
}

type Genres = 'friend' | 'channel' | 'guild' | 'guild-member' | 'guild-role' | 'guild-file' | 'guild-emoji'
type Actions = 'added' | 'deleted' | 'updated'

export type EventName =
    | `${Genres}-${Actions}`
    | 'message'
    | 'message-deleted'
    | 'message-updated'
    | 'message-pinned'
    | 'message-unpinned'
    | 'interaction/command'
    | 'reaction-added'
    | 'reaction-deleted'
    | 'reaction-deleted/one'
    | 'reaction-deleted/all'
    | 'reaction-deleted/emoji'
    | 'send'
    | 'friend-request'
    | 'guild-request'
    | 'guild-member-request'

export interface Event {
    id: number
    type: string
    selfId: string
    platform: string
    timestamp: number
    argv?: Argv
    channel?: Channel
    guild?: Guild
    login?: Login
    member?: GuildMember
    message?: Message
    operator?: User
    role?: GuildRole
    user?: User
    button?: Button
    _type?: string
    _data?: any
    /** @deprecated */
    subtype?: string
    /** @deprecated */
    subsubtype?: string
}

export type MessageLike = Message | Event

export const enum Opcode {
    EVENT = 0,
    PING = 1,
    PONG = 2,
    IDENTIFY = 3,
    READY = 4,
}

export interface GatewayPayloadStructure<O extends Opcode> {
    op: O
    body: GatewayBody[O]
}

export type ServerPayload = {
    [O in Opcode]: GatewayPayloadStructure<O>
}[Opcode.EVENT | Opcode.PONG | Opcode.READY]

export type ClientPayload = {
    [O in Opcode]: GatewayPayloadStructure<O>
}[Opcode.PING | Opcode.IDENTIFY]

export interface GatewayBody {
    [Opcode.EVENT]: Event
    [Opcode.PING]: {}
    [Opcode.PONG]: {}
    [Opcode.IDENTIFY]: {
        token?: string
        sequence?: number
    }
    [Opcode.READY]: {
        logins: Login[]
    }
}

export namespace WebSocket {
    /** The connection is not yet open. */
    export const CONNECTING = 0
    /** The connection is open and ready to communicate. */
    export const OPEN = 1
    /** The connection is in the process of closing. */
    export const CLOSING = 2
    /** The connection is closed. */
    export const CLOSED = 3

    export type ReadyState =
        | typeof CONNECTING
        | typeof OPEN
        | typeof CLOSING
        | typeof CLOSED

    export interface EventMap {
        open: Event
        error: ErrorEvent
        message: MessageEvent
        close: CloseEvent
    }

    export interface EventListener {
        (event: Event): void
    }

    export interface Event {
        type: string
        target: WebSocket
    }

    export interface CloseEvent extends Event {
        code: number
        reason: string
    }

    export interface MessageEvent extends Event {
        data: string
    }

    export interface ErrorEvent extends Event {
        message?: string
    }
}

export interface WebSocket {
    readonly url?: string
    readonly protocol?: string
    readonly readyState?: number
    close(code?: number, reason?: string): void
    send(data: string): void
    dispatchEvent?(event: any): boolean
    addEventListener<K extends keyof WebSocket.EventMap>(type: K, listener: (event: WebSocket.EventMap[K]) => void): void
    removeEventListener<K extends keyof WebSocket.EventMap>(type: K, listener: (event: WebSocket.EventMap[K]) => void): void
}

export type SatoriEvent = Event