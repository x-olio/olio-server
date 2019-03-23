
import { EncryptionAES192, DecryptAES192, MD5 } from "../../base/Cryption";
import { Config } from "../../base/Config";

export class User
{
    static MakeToken(uid: number, username: string)
    {

        let str = `${uid}|${username}|${Date.now()}`;
        return MD5(str);
        // let sign = MD5(str);
        // return EncryptionAES192(`${str}|${sign}`, Config.Instance.maketokenkey);
    }
    
}