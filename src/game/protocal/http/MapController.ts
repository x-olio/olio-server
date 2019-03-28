import { HttpAPIAttr, HttpAPI } from "../../../base/server/WebServer";
import { StoreUtils } from "../../../game/StoreUtils";
import { UserAPI } from "./UserAPI";
import { LangKey } from "../../../base/Lang";

// @HttpAPIAttr("/api/map/create_recv_bin")
@HttpAPIAttr("/api/map/savemap", "POST", "保存地图数据")
export class SaveMap extends UserAPI
{

    name: string = "";
    desc: string = "";
    data: string = "";
    async Next()
    {
        let map = await StoreUtils.Maps.FindSingWhere({
            "user_id": this.uid,
            "name": this.name
        });
        if (map)
        {
            map.name = this.name;
            map.desc = this.desc;
            map.data = this.data;
            map.save();
        } else
        {
            StoreUtils.Maps.dataMgr.create({
                name: this.name,
                desc: this.desc
            });
        }
        this.SendSuccess();
    }
}


@HttpAPIAttr("/api/map/readmap", "ANY", "获取地图列表")
export class ReadMap extends UserAPI
{
    async Next()
    {
        let list = await StoreUtils.Maps.Find("user_id", this.uid);
        this.SendSuccess(list);
    }
}

@HttpAPIAttr("/api/map/delmap", "GET", "删除地图")
export class DelMap extends UserAPI
{
    name: string = "";
    async Next()
    {
        let map = await StoreUtils.Maps.FindSingWhere({
            user_id: this.uid,
            name: this.name
        });

        if (!map)
            return this.SendError(LangKey("map_err0"));
        StoreUtils.Maps.Delete(map);

        this.SendSuccess();
    }
}


@HttpAPIAttr("/api/map/createblock", "POST", "创建地图块")
export class CreateBlock extends UserAPI
{

    name: string = "";
    desc: string = "";
    data: string = "";

    Next()
    {
        StoreUtils.MapBlocks.dataMgr.create({
            user_id: this.uid,
            name: this.name,
            desc: this.desc,
            data: this.data
        });
    }
}




@HttpAPIAttr("/api/map/readblock", "GET", "地图块列表")
export class ReadBlock extends HttpAPI
{
    token: string = "";
    name: string = "";
    Handle()
    {

    }
}



@HttpAPIAttr("/api/map/delblock", "GET", "删除地图块")
export class DelBlock extends HttpAPI
{
    token: string = "";
    name: string = "";
    Handle()
    {

    }
}



