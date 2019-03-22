import * as ws from "ws"

export class WebSocketConnect
{
    constructor(socket: WebSocket)
    {
        socket.onmessage = this.OnMessage.bind(this);
        socket.onerror = this.OnError.bind(this);
        socket.onclose = this.OnClose.bind(this);
    }

    private OnMessage(data)
    {
        if (data instanceof Buffer)
        {

        } else
        {

        }
    }

    private OnError(e)
    {

    }

    private OnClose(e) 
    {
        console.log("连接关闭");
        console.log(e);
    }
}