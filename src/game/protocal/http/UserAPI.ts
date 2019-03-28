import { HttpAPI } from "../../../base/server/WebServer";
import { LangKey } from "../../../base/Lang";
import { StoreUtils } from "../../../game/StoreUtils";

export abstract class UserAPI extends HttpAPI
{
    protected uid: number;

    async Handle()
    {
        let token = this.GetParam("token");

        if (!token)
            return this.SendError(LangKey("uesr_check_err0"));

        let verify = await StoreUtils.UserVerify.FindSigle("token", token);
        if (!verify)
            return this.SendError(LangKey("uesr_check_err0"));
        this.uid = verify.id;

        return this.Next();
    }

    abstract Next();

}