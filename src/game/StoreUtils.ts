import { DBStore } from "../base/store/DBStore";
import { MapModel, UserModel, UserVerifyModel } from "./modle";



export class StoreUtils
{
    public static Users: DBStore<UserModel>;
    public static Maps: DBStore<MapModel>;
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
                name: "un_index"
            }, {
                unique: false,
                fields: ["phone"],
                name: "un_index"
            },
        ]));

        this.Maps = new DBStore("olio_map");
        finishArrs.push(this.Maps.Init(MapModel, [
            {
                unique: false,
                fields: ["user_token", "name"],
                name: "ump_index"
            }
        ]));

        this.UserVerify = new DBStore("olio_userverify");
        finishArrs.push(this.UserVerify.Init(UserVerifyModel, [
            {
                unique: false,
                fields: ["token"],
                name: "uv_index"
            }
        ]));
        return finishArrs;
    }

    public static Init()
    {
        return new Promise((resolve) =>
        {
            let finishArrs = this.GetInitPromise();
            let count = 0, max = finishArrs.length;
            for (let item of finishArrs)            
            {
                item.then(() =>
                {
                    if (++count >= max)
                        resolve();
                });
            }
        });
    }
}