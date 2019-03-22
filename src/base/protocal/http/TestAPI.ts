import { HttpAPI, HttpAPIAttr } from "../../../base/server/WebServer";
import { StoreUtils } from "../../../game/StoreUtils";


@HttpAPIAttr("/api/testc")
export class TestC extends HttpAPI
{
    Handle()
    {
        // this.req.databuffer
        console.log(this.dataBuffer);
        this.res.render("hello", {
            hello: "xxxxxxxxxxxxx"
        });
    }
}

@HttpAPIAttr("/api/tests", "GET", `测试`)
export class TestH extends HttpAPI
{
    Handle()
    {
        
        let token = this.GetParam("token");
        let map = StoreUtils.Maps.FindSigle("user_token", token);

        // this.res.send(map);
        this.res.render("./child/c1.html", {
            serverMsg: Date.now()
        });
    }
}