import { DBStoreStatic } from "./base/store/DBStore"
import { Config } from "./base/Config";
import { OverrideConsole } from "./base/OverrideConsole";
import { StoreUtils } from "./game/StoreUtils";
import { WebServer } from "./base/server/WebServer";
import { WebSocketServet } from "./base/server/WebSocketServet";
export * from "./base/protocal";
export * from "./game/protocal";

async function Init()
{
    let dbConfig = Config.Instance["database"];
    DBStoreStatic.Init(dbConfig.db, dbConfig.host, dbConfig.port, dbConfig.user, dbConfig.password, (sqllog: string) =>
    {
        console.log(sqllog);
    });
    await StoreUtils.Init();
}


async function Start()
{
    OverrideConsole.Init();
    await Init();
    
    await new WebServer().InitService().Run();
    await new WebSocketServet().Run();
    
}


Start();