export interface IBlob
{
    encoding: string;
    //表单名
    fieldname: string;
    //文件类型
    mimetype: string;
    //文件名
    originalname: string;
    //字节大小
    size: number;
    //内存数据
    buffer: Buffer;
}