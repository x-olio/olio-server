const lconfig = {
    "user_login_err_0": "用户名或密码错"
};

export function LangKey(key: string): string
{
    return lconfig[key];
}