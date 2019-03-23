const lconfig = {
    "user_login_err_0": "用户名或密码错",
    "user_login_err_1": "用户名已存在",
    "token_err_0": "token验证失败",
    "token_err_1": "token无效",
    "token_err_2": "token过期",
};

export function LangKey(key: string): string
{
    return lconfig[key];
}