import { DBStoreModel, DBField, DBFieldType } from "../../base/store/DBStoreModel";

export class UserVerifyModel extends DBStoreModel
{
    user_id: number = 0;
    
    @DBField(DBFieldType.String64)
    public token: string = "";

    //有效时间
    public validtime: number = 0;
}