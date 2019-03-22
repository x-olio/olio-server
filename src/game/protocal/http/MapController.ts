import { HttpAPIAttr, HttpAPI } from "../../../base/server/WebServer";

@HttpAPIAttr("/api/map/create_recv_bin")
export class CreateMap extends HttpAPI
{
    user_token: string = "";
    name: string = "";
    desc: string = "";
    Handle()
    {

    }
}