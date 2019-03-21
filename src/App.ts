import { DBStoreStatic } from "./base/store/DBStore"
import { Config } from "./base/Config";
import { OverrideConsole } from "./base/OverrideConsole";
import { StoreUtils } from "./game/StoreUtils";



async function test()
{
    // let uint8s = new Uint8Array([255, 255]);
    // let buffer = new Buffer(uint8s);
    // let map = StoreUtils.Maps.BuildInstance({ name: "test", desc: "test_desc", user_token: "abc123", data_bin: buffer });
    // map.save();
    let map = await StoreUtils.Maps.FindSigle("name", "test");
    console.log(map.data_bin);
}

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
    test();
}


Start();