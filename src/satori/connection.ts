import EventEmitter from "react-native/Libraries/vendor/emitter/EventEmitter";
import { AutoReconnectWebSocket } from "./auto-reconnect-ws";
import { BotInfo, GatewayPayloadStructure, Login, Methods, Opcode, Event as SatoriEvent, convertSnakeObjectToCamel, createAPI } from "./protocol";

export const defaultConnectionInfo = {
    server: '',
    token: '',
    platform: '',
    id: '',
    https: false,
}

export type ConnectionInfo = typeof defaultConnectionInfo;

export const validateConnectionInfo = (connectionInfo: ConnectionInfo) => !(connectionInfo.server === '' || connectionInfo.token === '' || connectionInfo.platform === '' || connectionInfo.id === '')


// const wrapInheritAll = (evt: any, parent = null) => {
//     const d = new Proxy(evt, {
//         get(target, p, receiver) {
//             if (typeof target[p] === 'object')
//                 return wrapInheritAll(target[p], d) ?? parent?.[p]
//             return Reflect.get(target, p, receiver) ?? parent?.[p]
//         },
//     })

//     return d
// }


const wrapInheritAll = (evt: any) => {
    if(!evt['message']) return evt;
    for (const key in evt) {
        if (key !== 'message') evt['message'][key] ??= evt[key]
    }

    return evt
}

export class SatoriConnection extends EventEmitter {
    ws: AutoReconnectWebSocket;
    connectionInfo: ConnectionInfo;
    lastId: number | null = null;
    private botCache = new Map<string, Methods>();
    logins: Login[] = [];
    constructor(connectionInfo: ConnectionInfo) {
        super(null)
        if (!validateConnectionInfo(connectionInfo)) {
            throw new Error('Invalid connection info')
        }
        this.connectionInfo = connectionInfo;
        const protocol = connectionInfo.https ? 'wss' : 'ws';
        this.ws = new AutoReconnectWebSocket(`${protocol}://${connectionInfo.server}/v1/events`, [protocol]);

        this.ws.onMessage((ev) => {
            const data: GatewayPayloadStructure<any> = JSON.parse(ev.data);
            if (data.op === Opcode.EVENT) {
                const dataEvent = data as GatewayPayloadStructure<Opcode.EVENT>
                if (dataEvent.body.id !== undefined) {
                    this.lastId = dataEvent.body.id;
                }
                // console.log(dataEvent.body.type)
                this.emit('message', wrapInheritAll(data.body));
            }

            if(data.op === Opcode.READY) {
                this.logins = convertSnakeObjectToCamel(data.body.logins) as any;
            }
        });

        this.ws.onOpen(() => {
            console.log('satori onopen');
            this._sendRaw({
                op: Opcode.IDENTIFY,
                body: {
                    token: connectionInfo.token,
                    sequence: this.lastId,
                }
            })

            this.startPing();

            this.emit('open');
        });
    }

    bot(info: BotInfo = {}) {
        info ??= {};
        const key = `${info.platform}.${info.selfId}`;
        if (!this.botCache.has(key)) {
            this.botCache.set(key, createAPI({
                platform: info.platform,
                id: info.selfId,
                https: false,
                server: '192.168.31.246:6140/satori',
                token: ''
            }, info));
        }
        return this.botCache.get(key);
    }

    lastPingHandler = null;
    startPing() {
        if (this.lastPingHandler !== null) {
            clearInterval(this.lastPingHandler);
        }

        this.lastPingHandler = setInterval(() => {
            this._sendRaw({
                op: Opcode.PING
            })
        }, 10 * 1000);
    }


    _sendRaw(data: any) {
        this.ws.send(JSON.stringify(data));
    }
}