import { HttpAPIAttr, HttpAPI } from "../../../base/server/WebServer";
import { StoreUtils } from "../../../game/StoreUtils";
import { LangKey } from "../../../base/Lang";
import { User } from "../../users/User";

@HttpAPIAttr("/api/user/public/register", "POST", "用户注册")
export class UserRegister extends HttpAPI
{
    nickname: string = "";
    username: string = "";
    password: string = "";
    phone: string = "";
    email: string = "";

    async Handle()
    {
        let user = await StoreUtils.Users.FindSigle("username", this.username);
        if (user)
            return this.SendJson(this.Error(LangKey("user_login_err_1"), -1));

        user = await StoreUtils.Users.dataMgr.create(this);

        let token = User.MakeToken(user.id, this.username);
        let validtime = Date.now() + 84600;
        await StoreUtils.UserVerify.dataMgr.create({
            user_id: user.id,
            validtime: validtime
        });
        return this.SendJson(this.Success({
            token: token,
            validtime: validtime
        }));
    }
}


@HttpAPIAttr("/api/user/public/login/uname", "POST", "用户登录")
export class UserLoginUname extends HttpAPI
{
    username: string = "";
    password: string = "";
    async Handle()
    {
        let user = await StoreUtils.Users.dataMgr.findOne({
            where: {
                username: this.username,
                password: this.password
            }
        });

        if (!user)
            return this.SendJson(this.Error(LangKey("user_login_err_0"), -1))

        let token = User.MakeToken(user.id, this.username);

        let validtime = Date.now() + 84600;

        let verify = await StoreUtils.UserVerify.FindSigle(user.id, "user_id");

        if (verify)
        {
            verify.validtime = validtime;
        } else
            verify = await StoreUtils.UserVerify.dataMgr.create({
                user_id: user.id,
                validtime: validtime
            });

        return this.SendJson(this.Success({
            token: token,
            validtime: validtime
        }));
    }
}


@HttpAPIAttr("/api/user/reftoken", "POST", "刷新令牌")
export class UserRefreshToken extends HttpAPI
{
    id: number;
    token: string;

    async Handle()
    {
        let info = User.ResolveToken(this.token);

        if (`${info.uid}` != `${this.id}`)
            return this.SendJson(this.Error(LangKey("token_err_0"), -1));

        let verify = await StoreUtils.UserVerify.FindSigle(this.id, "user_id");

        if (!verify)
            return this.SendJson(this.Error(LangKey("token_err_1"), -2));

        verify.validtime = Date.now() + 86400;

        verify.save();

        this.SendJson(this.Success());
    }
}