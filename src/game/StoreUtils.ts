import { DBStore } from "../base/store/DBStore";
import { MapModel, UserModel, UserVerifyModel, MapBlockModel } from "./modle";




export class StoreUtils
{
    public static Users: DBStore<UserModel>;
    public static Maps: DBStore<MapModel>;
    public static MapBlocks: DBStore<MapBlockModel>;
    public static UserVerify: DBStore<UserVerifyModel>;

    private static GetInitPromise()
    {
        let finishArrs = new Array<Promise<any>>();

        this.Users = new DBStore("olio_user");
        finishArrs.push(this.Users.Init(UserModel, [
            {
                unique: true,
                fields: ["username"],
                name: "un_index"
            },
            {
                unique: false,
                fields: ["email"],
                name: "uemail_index"
            }, {
                unique: false,
                fields: ["phone"],
                name: "uphone_index"
            },
        ]));

        this.Maps = new DBStore("olio_map");
        finishArrs.push(this.Maps.Init(MapModel, [
            {
                unique: false,
                fields: ["user_id"],
                name: "mp_uid_index"
            },
            {
                unique: false,
                fields: ["name"],
                name: "mp_name_index"
            }
        ]));

        this.UserVerify = new DBStore("olio_userverify");
        finishArrs.push(this.UserVerify.Init(UserVerifyModel, [
            {
                unique: true,
                fields: ["token", "user_id"],
                name: "uv_pri_index"
            }
        ]));

        this.Maps = new DBStore("olio_map");
        finishArrs.push(this.Maps.Init(MapModel, [
            {
                unique: true,
                fields: ["user_id", "name"],
                name: "mp_pri_index"
            }
        ]));

        this.MapBlocks = new DBStore("olio_mapblock");
        finishArrs.push(this.MapBlocks.Init(MapBlockModel, [
            {
                unique: true,
                fields: ["user_id", "name"],
                name: "mb_pri_index"
            }
        ]));
        return finishArrs;
    }

    public static Init()
    {
        return Promise.all(this.GetInitPromise());
    }
}