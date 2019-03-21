import { DBStore } from "../base/store/DBStore";
import { MapModel } from "./modle/MapModel";
import { UserModel } from "./modle/UserModel";

export class StoreUtils
{
    public static Users: DBStore<UserModel>;
    public static Maps: DBStore<MapModel>;

    private static GetInitPromise()
    {
        let finishArrs = new Array<Promise<any>>();

        this.Users = new DBStore("olio_user");
        finishArrs.push(this.Users.Init(UserModel, [{
            unique: true,
            fields: ["token"],
            name: "uq_index"
        }]));

        this.Maps = new DBStore("olio_map");
        finishArrs.push(this.Maps.Init(MapModel, [
            {
                unique: false,
                fields: ["user_token", "name"],
                name: "ump_index"
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