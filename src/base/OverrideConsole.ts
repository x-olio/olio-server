import * as moment from "moment"

export abstract class OverrideConsole
{
    private static log = console.log;
    private static warn = console.warn;
    private static err = console.error;

    static Init()
    {
        console.log = function (text: string)
        {
            OverrideConsole.log(`[${moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")}] ${text}`);
        }
        console.warn = function (text: string)
        {
            OverrideConsole.warn(`[${moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")}] ${text}`);
        }
        console.error = function (text: string)
        {
            OverrideConsole.err(`[${moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")}] ${text}`);
        }
    }
}