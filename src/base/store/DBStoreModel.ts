

import * as Sequelize from "sequelize"
export enum DBFieldType
{
    String32,
    String40,
    String64,
    String80,
    String256,
    Buffer,
    DATE
}


const fieldInfos = new Map<any, Map<string, DBFieldType>>();

export function DBField(type: DBFieldType)
{
    return function (target: any, propertyKey: string)
    {
        let fmaps = fieldInfos.get(target.constructor);
        if (!fmaps)
        {
            fmaps = new Map();
            fieldInfos.set(target.constructor, fmaps);
        }
        fmaps.set(propertyKey, type);
    }
}
export function GetFieldInfo(): Map<any, Map<string, DBFieldType>>
{
    return fieldInfos;
}
/**
 * DBStore存储数据模型
 * 数据存储单元必须继承此类 
 * 成员必须包含默认值 (数据类型支持 string | number | boolean|Array|Object)
 */
export class DBStoreModel 
{
    /**
     * 保留属性
     */
    public id: number = 0;

    /**
     * 保存该对象数据
     */
    public save() { }
    /**
     * 销毁(删除)该对象数据 
     */
    public destroy() { }
    /**
     * 标记字段 已被更改 (这个方法用在 引用类型数据 Array||Object)
     * @field 自己的字段名
     */
    public updateField(field: string) { }

    public toJSON():any { }
}
