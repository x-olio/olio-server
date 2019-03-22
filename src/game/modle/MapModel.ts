import { DBStoreModel, DBField, DBFieldType } from "../../base/store/DBStoreModel";

export class MapModel extends DBStoreModel
{


    user_id: number = 0;

    @DBField(DBFieldType.String32)
    name: string = "";

    desc: string = "";

    @DBField(DBFieldType.Buffer)
    data_bin: Uint8Array = new Uint8Array([]);

}