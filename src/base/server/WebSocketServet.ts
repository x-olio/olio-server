
import * as http from "http";
import * as ws from "ws";
import { WebSocketConnect } from "./WebSocketConnect";
import { Config } from "../Config";

export class WebSocketServet
{

    public server: ws.Server;
    
    constructor()
    {

    }

    Run()
    {
        return new Promise((resolve) =>
        {
            let config = Config.Instance.websocket;
            this.server = new ws.Server({ port: config.port, host: config.host });

            this.server.on("listening", () =>
            {
                console.log(`websocket 服务启动完成 ${config.host}:${config.port}`);
                resolve();
            });


            this.server.on("connection", (socket: WebSocket) =>
            {
                new WebSocketConnect(socket);
            });

            this.server.on("error", (err) =>
            {
                console.error(err);
            });
        });
    }
}