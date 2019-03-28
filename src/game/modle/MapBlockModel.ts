import { DBStoreModel, DBField, DBFieldType } from "../../base/store/DBStoreModel";


export class MapBlockModel extends DBStoreModel
{


    user_id: number = 0;

    @DBField(DBFieldType.String32)
    name: string = "";

    desc: string = "";

    data: string = "";

}