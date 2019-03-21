import { DBStoreModel, DBField, DBFieldType } from "../../base/store/DBStoreModel";

export class UserModel extends DBStoreModel
{

    @DBField(DBFieldType.String32)
    public name: string = "";
    
    @DBField(DBFieldType.String64)
    public token: string = "";
}