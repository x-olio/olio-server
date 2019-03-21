import * as express from "express"
import * as bodyParser from "body-parser"
// import { Express } from "express"
import * as http from "http"
import * as https from "https"
import * as fs from "fs"
// import * as multiparty from "multiparty"
// import * as formidable from "formidable"
import * as  multer from "multer"
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

export abstract class IHttpHandle
{
    constructor(protected req: express.Request, protected res: express.Response, protected next: express.NextFunction)
    {

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
        IHttpHandle.SendJson(this.res, content);
    }
    // public GetPost(callback: (err, fields, files: any) => void)
    // {
    //     var form = new formidable.IncomingForm();
    //     form.parse(this.req, callback);
    // }

    public GetParam(key: string)
    {
        return this.req.query[key] || this.req.body[key];
    }

    public Handle()
    {

    }
}


export function HttpHandleAttr(url: string)
{
    return function (constructor)
    {
        console.log(`注册处理器:${url}`);
        WebServer.handles.set(url, constructor);
    }
}


export class WebServer
{
    public static handles: Map<string, any> = new Map<string, any>();
    public ready: boolean = true;
    private app: express.Express;

    public constructor()
    {

    }
    private InitService()
    {
        if (Config.Instance.http)
        {
            let httpServer = http.createServer(this.app);
            httpServer.listen(Config.Instance.http.port, () =>
            {
                console.log(`开启HTTP服务完成 listener :${Config.Instance.http.port}`);
            });

        }
        let ports = [];
        ports.push(Config.Instance.http.port);

        if (Config.Instance.https && Config.Instance.https.port && Config.Instance.https.credentials)
        {
            if (!fs.existsSync(Config.Instance.https.credentials.key))
                return console.log("https开启失败 缺少私钥");
            if (!fs.existsSync(Config.Instance.https.credentials.cert))
                return console.log("https开启失败 缺少证书");

            let options = {
                key: fs.readFileSync(Config.Instance.https.credentials.key).toString(),
                cert: fs.readFileSync(Config.Instance.https.credentials.cert).toString()
            };

            let httpsServer = https.createServer(options, this.app);

            httpsServer.listen(Config.Instance.https.port, () =>
            {
                console.log(`开启HTTPS服务完成 listener :${Config.Instance.https.port}`);

            });
            ports.push(Config.Instance.https.port);
        }


    }

    public async Run()
    {


        this.app = express();

        this.InitService();

        this.app.use(bodyParser.urlencoded());
        this.app.use(bodyParser.json());
        this.app.use(multer().single());

        this.app.all("*", (req: express.Request, res: express.Response, next: express.NextFunction) =>
        {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
            res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
            let handleCls = WebServer.handles.get(req.path);
            if (!handleCls)
                return res.send(`nofind requst:${req.path}`);
            let handle: IHttpHandle = new handleCls(req, res, next);
            let result = handle.Handle.apply(handle);
            if (result && !(result instanceof Promise))
                res.send(JSON.parse(result));
        });

    }


}