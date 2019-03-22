import { DBStoreModel, DBField, DBFieldType } from "../../base/store/DBStoreModel";

export class UserModel extends DBStoreModel
{
    @DBField(DBFieldType.String32)
    public username: string = "";

    @DBField(DBFieldType.String32)
    public nickname: string = "";

    @DBField(DBFieldType.String32)
    public password: string = "";

    @DBField(DBFieldType.String32)
    public phone: string = "";
    
    @DBField(DBFieldType.String64)
    public email: string = "";
}