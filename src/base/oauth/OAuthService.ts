
const ExpressOAuthServer = require("express-oauth-server");
import { WebServer } from "../server/WebServer";

export class OAuthService
{
    

    constructor(webserver: WebServer, models)
    {
        let oauth = new ExpressOAuthServer({
            model: {}
    
        });
        webserver.app.use(oauth.authorize());    
    }
}