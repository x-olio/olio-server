import { HttpAPIAttr, HttpAPI } from "../../../base/server/WebServer";
import { StoreUtils } from "../../../game/StoreUtils";
import { UserAPI } from "./UserAPI";
import { LangKey } from "../../../base/Lang";
import { IBlob } from "./Defile";
import * as fs from "fs";
import * as path from "path";
import { MD5 } from "../../../base/Cryption";
import * as mkdirp from "mkdirp";

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
        let upfile: IBlob = this.req.files[0];

        let extName = upfile.originalname.substring(upfile.originalname.lastIndexOf("."));

        let hash = MD5(`${this.uid}_${Date.now()}_${upfile.originalname}`);

        let filename = `${hash}${extName}`;

        let uploadDir = `/files/blocks/${this.uid}`;

        let url = `${uploadDir}/${filename}`;

        let filePath = path.normalize(`.${url}`);

        if (!fs.existsSync(`.${uploadDir}`))
        {
            
            
            
            mkdirp(`.${uploadDir}`, (err) =>
            {
                if (err)
                    return console.error(err);
                fs.writeFileSync(filePath, upfile.buffer);
            });
        } else
        {
            fs.writeFileSync(filePath, upfile.buffer);
        }


        let dataJSON = JSON.parse(this.data);

        dataJSON.refImgs = [url];

        this.data = JSON.stringify(dataJSON);


        StoreUtils.MapBlocks.dataMgr.create({
            user_id: this.uid,
            name: this.name,
            desc: this.desc,
            data: this.data
        });

        this.SendSuccess(dataJSON);
    }
}





@HttpAPIAttr("/api/map/readblock", "GET", "地图块列表")
export class ReadBlock extends UserAPI
{
    token: string = "";
    name: string = "";
    async Next()
    {
        let list = await StoreUtils.MapBlocks.Find("user_id", this.uid);
        this.SendSuccess(list);
    }
}



@HttpAPIAttr("/api/map/delblock", "GET", "删除地图块")
export class DelBlock extends UserAPI
{
    name: string = "";
    async Next()
    {
        let block = await StoreUtils.MapBlocks.FindSingWhere({
            user_id: this.uid,
            name: this.name
        });
        if (!block)
            return this.Error(LangKey("map_block_err0"));
        let dataJSON = JSON.parse(block.data);
        if (dataJSON.refImgs)
        {
            for (let item of dataJSON.refImgs)
            {
                let filename = path.normalize(`${process.cwd()}/${item}`);
                console.log(`del file: ${filename}`);
                fs.unlinkSync(filename);
            }
        }
        StoreUtils.MapBlocks.Delete(block);
        return this.Success();
    }
}


