
import * as Sequelize from "sequelize"
import { DBStoreModel, GetFieldInfo, DBFieldType } from "./DBStoreModel";
export type ClassType<T> = { new(...args): T };
export interface DBModelIndex
{
    unique?: boolean;
    fields?: Array<string>;
    method?: string;
    name?: string;
}

export class DBStoreStatic
{
    private static sequeliseInst: Sequelize.Sequelize;

    public static GetInst()
    {
        return this.sequeliseInst;
    }

    public static Init(database: string, host: string, port: number, user: string, password: string, logCallback: (sqlLog: string) => void)
    {
        let options = {
            "logging": logCallback,
            "benchmark": true,
            "dialect": "mysql",
            "port": port,
            "operatorsAliases": false,
            "define": {
                "underscored": false,
                "freezeTableName": false,
                "charset": "utf8mb4",
                "dialectOptions": {
                    "charset": "utf8mb4",
                    "collate": "utf8mb4_general_ci",
                    "supportBigNumbers": true,
                    "bigNumberStrings": true
                },
                "timestamps": true
            },
            "replication": {
                "read": [
                    {
                        "host": host,
                        "username": user,
                        "password": password
                    }
                ],
                "write": {
                    "host": host,
                    "username": user,
                    "password": password
                }
            },
            "pool": {
                "max": 50,
                "idle": 30
            }, "dialectOptions": {
                "charset": "utf8mb4",
                "supportBigNumbers": true,
                "bigNumberStrings": true
            },

        };

        this.sequeliseInst = new Sequelize(
            database, user, password, options
        );
    }
}

export type DBStoreFieldType = string | number | boolean | Array<any> | Object;

function updateField(field: string)
{
    if (!(field in this))
        throw new Error(`没有找到要修改的属性 [${field}]!!`);
    this[field] = this[field];
    this.changed(field, true);
}

/**
 * DBStore存储
 */
export class DBStore<T extends DBStoreModel>  {
    public dataMgr: Sequelize.Model<T, any>;
    private template: T;
    private model: ClassType<T>;
    private objField = new Set();

    public Op = Sequelize.Op;
    constructor(public name: string)
    {

    }

    private GetCacheOne(where, callback, count = 0)
    {
        this.dataMgr.findOne({ where: where }).then((r) =>
        {
            callback(r);
        });

    }

    private BuildModule(data, model = undefined, count = 0)
    {
        return new Promise((resolve) =>
        {
            if (!model)
            {
                model = this.dataMgr.build(data, {
                    isNewRecord: false
                });
            }

            if (!model.id)
            {
                if (count > 2)
                    return resolve(null);

                setTimeout(() =>
                {
                    this.BuildModule(data, model, ++count);
                }, 10);
            } else
            {
                // console.log("init model finish");
                resolve(model);
            }
        });
    }
    /**
    * 外挂到model 在构建时绑定资源
    */
    private HookBuildModel()
    {
        let oldBuild = this.dataMgr.build;
        let self = this;

        this.dataMgr["build"] = function (values, options)
        {
            let inst = new self.model();
            let model = oldBuild.call(this, values, options);
            if (model["updateField"])
                return model;
            // let md = model as any;
            self.objField.forEach((key) =>
            {
                if (model[`$_${key}`])
                    return;
                let options = {};
                options[key] = {
                    get: function ()
                    {
                        let strv = model.getDataValue(key);
                        if (!model[`$_${key}`])
                            model[`$_${key}`] = strv && typeof (strv) == "string" ? JSON.parse(strv) : inst[key];
                        return model[`$_${key}`];
                    },
                    set: function (value)
                    {
                        model[`$_${key}`] = value;
                        model.setDataValue(key, value ? JSON.stringify(value) : null);
                    }
                };
                Object.defineProperties(model, options);
            });

            model["updateField"] = updateField;
            return model;
        }
    }

    public async Init(model: ClassType<T>, indexs: Sequelize.DefineIndexesOptions[] = undefined)
    {

        this.model = model;
        let options: any = {};

        let inst = new this.model();

        this.template = inst;


        let fieldInfo = GetFieldInfo().get(model);
        try
        {
            for (let key in inst)
            {
                let type: string = typeof (inst[key]);
                if (key == "id")
                {
                    options[key] = { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true };
                    continue;
                }

                let dbtp = fieldInfo.get(key);
                if (dbtp != undefined)
                    type = DBFieldType[dbtp];

                let seType: Sequelize.DataTypeAbstract;


                switch (type)
                {
                    case "string":
                        seType = Sequelize.TEXT;
                        break;
                    case "number":
                        seType = Sequelize.DOUBLE;
                        break;
                    case "boolean":
                        seType = Sequelize.BOOLEAN;
                        break;
                    case DBFieldType[DBFieldType.String32]:
                        seType = Sequelize.STRING(32);
                        break;
                    case DBFieldType[DBFieldType.String40]:
                        seType = Sequelize.STRING(40);
                        break;
                    case DBFieldType[DBFieldType.String80]:
                        seType = Sequelize.STRING(80);
                        break;
                    case DBFieldType[DBFieldType.String64]:
                        seType = Sequelize.STRING(64);
                        break;
                    case DBFieldType[DBFieldType.String256]:
                        seType = Sequelize.STRING(256);
                        break;
                    case DBFieldType[DBFieldType.Buffer]:
                        seType = Sequelize.BLOB;
                        break;
                    case DBFieldType[DBFieldType.DATE]:
                        seType = Sequelize.DATE;
                        break;

                    default:
                        this.objField.add(key);
                        options[key] = {
                            type: Sequelize.TEXT,
                            get: function ()
                            {
                                let strv = this.getDataValue(key);
                                if (!this[`$_${key}`])
                                    this[`$_${key}`] = strv && typeof (strv) == "string" ? JSON.parse(strv) : this[key];
                                return this[`$_${key}`];
                            },
                            set: function (value)
                            {
                                this[`$_${key}`] = value;
                                this.setDataValue(key, value ? JSON.stringify(value) : null);
                            }
                        };

                        continue;
                }

                options[key] = { type: seType, allowNull: false, defaultValue: inst[key] };//inst[key];

            }


            // 
            this.dataMgr = DBStoreStatic.GetInst().define(this.name, options, { indexes: indexs });
            this.HookBuildModel();
            await this.dataMgr.sync({ alter: true });

        } catch (e)
        {
            console.error(`[${this.name}]Store初始化 错误:${e.stack}`);
        }

    }


    public async CreateInstance()
    {

        let { id, ...clone } = <any>this.template;
        let result: T = await this.dataMgr.create(clone);
        return result;
    }
    public BuildInstance(value?: any): T
    {
        return this.dataMgr.build(value);
    }

    public async Find(field: string, findValue: DBStoreFieldType,
        offset: number = 0, count: number = 20000,
    )
    {
        let where: any = {};
        where[field] = findValue;
        return this.FindMoreWhere(where, offset, count);
    }

    public async FindMoreWhere(where: { [key: string]: string }, offset: number = 0, count: number = 2000)
    {
        return new Promise<Array<T>>((resolve) =>
        {
            this.dataMgr.findAll({
                where: where,
                offset: offset,
                limit: count
            }).then((result) =>
            {
                resolve(result);
            }).catch((e) =>
            {
                console.error(e);
            })
        });
    }

    public FindSigle(field, findValue: DBStoreFieldType)
    {
        let where: any = {};
        where[field] = findValue;
        return this.FindSingWhere(where);
    }

    public FindSingWhere(where)
    {
        return new Promise<T>((resolve) =>
        {
            this.GetCacheOne(where, (model) =>
            {
                resolve(model);
            });
        });
    }


    public async FindSigleOrCreate(field, findValue: DBStoreFieldType)
    {
        try
        {
            let where: any = {};
            where[field] = findValue;
            let result = await this.dataMgr.findOrCreate({
                where: where
            });
            return result[0] as T;
        } catch (e)
        {
            console.error(`[${this.constructor.name}]Store FindSigle 错误:${e.stack}`);
            return null;
        }
    }

    public Delete(model: DBStoreModel): Promise<number>
    public Delete(id: number): Promise<number>
    public async Delete(id): Promise<number>
    {
        try
        {

            let _id: number;
            if (typeof (id) != "number")
            {
                if (!id)
                    return 0;
                _id = id.id;
            }
            else
                _id = id;
            return await this.dataMgr.destroy(_id ? {
                where: {
                    id: _id
                }
            } : undefined);
        } catch (e)
        {
            console.error(`[${this.constructor.name}]Store Delete 错误:${e.stack}`);
            return 0;
        }

    }

    public async DeleteAll()
    {
        try
        {
            return await this.dataMgr.destroy({
                where: {
                    id: {
                        [Sequelize.Op.ne]: -1
                    }
                }
            });
        } catch (e)
        {
            console.error(`[${this.constructor.name}]Store DeleteAll 错误:${e.stack}`);
            return 0;
        }
    }

    public async Count(where: {} = undefined): Promise<number>
    {
        return this.dataMgr.count({ where: where, col: "id" })
    }
    public Query(sqlcmd: string)
    {
        return new Promise((resolve) =>
        {
            DBStoreStatic.GetInst().query(sqlcmd).then((result) =>
            {
                resolve(resolve);
            }).catch((e) =>
            {
                console.error(e);
            });
        });
    }
}
