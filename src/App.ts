import { DBStoreStatic } from "./base/store/DBStore"
import { Config } from "./base/Config";
import { OverrideConsole } from "./base/OverrideConsole";
import { StoreUtils } from "./game/StoreUtils";
import { WebServer } from "./base/server/WebServer";
import { WebSocketServet } from "./base/server/WebSocketServet";
import { OAuthService } from "./base/OAuth/OAuthService";
export * from "./base/protocal";


async function Init()
{
    let dbConfig = Config.Instance["database"];
    DBStoreStatic.Init(dbConfig.db, dbConfig.host, dbConfig.port, dbConfig.user, dbConfig.password, (sqllog: string) =>
    {
        // console.log(sqllog);
    });
    await StoreUtils.Init();
}


async function Start()
{
    OverrideConsole.Init();
    await Init();
    let webserver = new WebServer();    
    await webserver.Run();
    let wserver = new WebSocketServet();
    await wserver.Run();
}


Start();