import * as express from "express"
import * as bodyParser from "body-parser"
import * as http from "http"
import * as  multer from "multer"
import * as path from "path"
import { Config } from "../Config";

export class IResult
{
    error: number = 1;
    body: any;
    message: string;
    constructor(error: number, body: any, message: string)
    {
        this.error = error;
        this.body = body;
        this.message = message;
    }
}


export class ErrorResult extends IResult
{
    constructor(errorCode: number, public message: string)
    {
        super(errorCode, null, "error");
    }
}

export class SuccessRsult extends IResult
{
    constructor(body: any)
    {
        super(0, body, "success")
    }
}

const noSetKey = new Set<string>(["req", "res", "next"]);
export abstract class HttpAPI
{
    dataBuffer: Buffer;
    constructor(protected req: express.Request, protected res: express.Response, protected next: express.NextFunction)
    {

    }

    public Init()
    {
        for (let key of Object.keys(this))
        {
            if (!noSetKey.has(key))
            {
                let value = this.GetParam(key);
                this[key] = value;
            }
        }
    }
    protected static SendJson(res: express.Response, content: any)
    {
        try
        {
            res.send(JSON.stringify(content || {}));
        } catch (e)
        {
            console.error(e);
        }
    }
    public static Error(message: any, code: number = 1): IResult
    {
        return new ErrorResult(code, message);
    }

    public static Success(body: any): IResult
    {
        return new SuccessRsult(body);
    }

    public Error(message: any = {}, code: number = 1): IResult
    {
        return new ErrorResult(code, message);
    }

    public Success(body: any = {}): IResult
    {
        return new SuccessRsult(body);
    }
    public SendJson(content: any)
    {
        HttpAPI.SendJson(this.res, content);
    }

    public SendSuccess(body: any = {})
    {
        HttpAPI.SendJson(this.res, new SuccessRsult(body));
    }
    public SendError(message: any = {}, code: number = 1)
    {
        HttpAPI.SendJson(this.res, new ErrorResult(code, message));
    }


    public GetParam(key: string)
    {
        return this.req.query[key] || this.req.body[key];
    }

    public Handle()
    {

    }
}

export interface HttpAPIInfo
{
    url: string;
    method: "GET" | "POST" | "ANY";
    desc?: string;
    ctor: any;
}
export interface APIFieldInfo
{
    name: string;
    desc: string;
    type?: string;
}
export function HttpAPIAttr(url: string, method: "GET" | "POST" | "ANY" = "ANY", desc?: string)
{
    return function (ctor)
    {
        console.log(`${url},${method},${desc || "[无备注]"}`);
        WebServer.handles.set(url, { url, method, desc, ctor });
    }
}

export function APIField(desc: string, type?: string)
{
    return function (target, propertyKey: string)
    {

    }
}

export class WebServer
{
    public static handles: Map<string, HttpAPIInfo> = new Map<string, HttpAPIInfo>();

    public app: express.Express;

    public server: http.Server;

    constructor()
    {

        this.app = express();
        this.app.engine('html', require("ejs").__express);
        this.app.set('view engine', 'html');
        this.app.use(bodyParser.urlencoded());
        this.app.use(bodyParser.json());
        // let single = multer().single();
        this.app.use(multer().any());

        let headConfig = Config.Instance.http.headers;
        let paths = Config.Instance.publicdir;
        for (let item of paths)
        {
            let staticDir = path.join(process.cwd(), item);
            this.app.use(item, express.static(staticDir, {
                setHeaders: (res) =>
                {
                    if (headConfig)
                        for (let key in headConfig)
                            res.header(key, headConfig[key]);
                }
            }));
            console.log(`设置静态路径 ${staticDir} -> ${item}`);
        }
    }

    public InitService()
    {
        let headConfig = Config.Instance.http.headers;
        this.app.all("*", (req: express.Request, res: express.Response, next: express.NextFunction) =>
        {
            if (headConfig)
                for (let key in headConfig)
                    res.header(key, headConfig[key]);


            let handleCls = WebServer.handles.get(req.path);
            if (!handleCls)
                return res.send(`nofind requst:${req.path}`);

            if (handleCls.method != "ANY" && req.method != handleCls.method)
                return res.send("error request");

            let handle: HttpAPI = new handleCls.ctor(req, res, next);
            handle.Init();
            if (req.query["recv_bin"] == "1")
            {
                let msg = [];
                req.on("data", (chunk) =>
                {
                    msg.push(chunk);
                });
                req.on("end", () =>
                {
                    handle.dataBuffer = Buffer.concat(msg);
                    this.Next(handle, res);
                });
            } else
                this.Next(handle, res);
        });
        return this;
    }

    public async Run()
    {
        if (Config.Instance.http)
        {
            this.server = http.createServer(this.app);
            this.server.listen(Config.Instance.http.port, () =>
            {
                console.log(`开启HTTP服务完成 listener :${Config.Instance.http.port}`);
            });
        }
    }

    Next(handle: HttpAPI, res: express.Response)
    {
        let result = handle.Handle.apply(handle);
        if (result && !(result instanceof Promise))
            res.send(JSON.parse(result));
        else if (result instanceof Promise)
        {
            result.then((value) =>
            {
                if (value && typeof (value) == "object")
                    res.send(value);
            });
        }
    }

}