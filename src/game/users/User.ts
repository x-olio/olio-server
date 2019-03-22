
import { MD5 } from "../../base/Cryption";

export class User
{
    static MakeToken(username: string)
    {
        return MD5(`${username}${Date.now()}`);
    }
}