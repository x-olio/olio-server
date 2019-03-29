const lconfig = {
    "user_login_err_0": "用户名或密码错",
    "user_login_err_1": "用户名已存在",
    "uesr_check_err0": "授权错误",
    "uesr_check_err1": "授权失效或验证错误",
    "token_err_0": "token验证失败",
    "token_err_1": "token无效",
    "token_err_2": "token过期",
    "map_err0": "地图信息错误",
    "map_block_err0": "地块信息错误"
};

export function LangKey(key: string): string
{
    return lconfig[key];
}