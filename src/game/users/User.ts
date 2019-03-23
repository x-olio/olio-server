
import { EncryptionAES192, DecryptAES192, MD5 } from "../../base/Cryption";
import { Config } from "../../base/Config";

export class User
{
    static MakeToken(uid: number, username: string)
    {

        let str = `${uid}|${username}|${Date.now()}`;
        let sign = MD5(str);
        return EncryptionAES192(`${str}|${sign}`, Config.Instance.maketokenkey);
    }
    static ResolveToken(token: string)
    {
        let str = DecryptAES192(token, Config.Instance.maketokenkey);

        let infos = str.split("|");
        let sign = infos[3];
        let verstr = `${infos[0]}|${infos[1]}|${infos[2]}`;
        if (sign != verstr)
            return;
        return {
            uid: infos[0],
            username: infos[1],
            time: [2]
        }
    }
}