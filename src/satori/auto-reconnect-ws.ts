import { Methods, createAPI } from "./protocol";

export class AutoReconnectWebSocket {
    url: string;
    protocols: string | string[] | null | undefined;
    ws: WebSocket;

    constructor(url: string, protocols: string | string[] | null | undefined) {
        this.url = url;
        this.protocols = protocols;
        this.ws = new WebSocket(url, protocols);
        this.ws.onclose = (ev: any) => {
            console.log('onclose', ev);
            const newWs = new WebSocket(url, protocols);
            newWs.onopen = this.ws.onopen;
            newWs.onmessage = this.ws.onmessage;
            newWs.onerror = this.ws.onerror;
            newWs.onclose = this.ws.onclose;
        };
    }
    send(data: any) {
        // console.log('send', data);
        this.ws.send(data);
    }
    close() {
        this.ws.close();
    }

    onMessage(callback: (ev: WebSocketMessageEvent) => void) {
        this.ws.onmessage = callback;
    }

    onError(callback: (ev: WebSocketErrorEvent) => void) {
        this.ws.onerror = callback;
    }

    onClose(callback: (ev: WebSocketCloseEvent) => void) {
        this.ws.onclose = callback;
    }

    onOpen(callback: () => void) {
        this.ws.onopen = callback;
    }
}