
import * as crypto from "crypto";


export function EncryptionAES192(content: string, password: string): string
{
    const cipher = crypto.createCipher('aes192', password);
    let encrypted = cipher.update(content, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

export function DecryptAES192(encStr: string, password: string): string
{
    let decipher = crypto.createDecipher("aes192", password);
    let decrypted = decipher.update(encStr, "hex", "utf8");
    decrypted += decipher.final('utf8');
    return decrypted;
}


export function EncryptionSHA1(content: string): string
{
    // var cipher = crypto.createHmac('sha1', password);
    // return cipher.update(content).digest("hex");//.toString("base64");
    return crypto.createHash('sha1').update(content).digest('hex');
}

export function MD5(content: string): string
{
    var md5 = crypto.createHash('md5');

    md5.update(new Buffer(content));

    return md5.digest('hex');
}