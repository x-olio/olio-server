import * as fs from "fs"
import * as stripJsonComments from "strip-json-comments"

export interface HostConfig
{
    address: string;
    port: number;


}
export interface HttpsConfig extends HostConfig
{
    credentials: { key: string, cert: string };
}

/**
 * 数据中心配置
 */
export interface DataConentConfig
{
    host: string;//远程主机
    port: number;//远程端口
    password: string;//密码
}
export class Config
{
    private static instance: Config;

    public http: HostConfig;
    public https: HttpsConfig;
  
    public static get Instance(): Config
    {

        if (!this.instance)
        {
            this.instance = new Config();
        }
        return this.instance;
    }

    public Reload()
    {
        let config = JSON.parse(stripJsonComments(fs.readFileSync("./config.json").toString()));
        for (let key in config)
            this[key] = config[key];
    }


    constructor()
    {
        fs.watchFile("./config.json", (curr, prev) =>
        {
            console.log("重新加载config.json");
            this.Reload();
            console.log("加载config.json完成");
        });
        this.Reload();
    }

}