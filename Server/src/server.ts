import * as express from "express";
import * as bodyParser from "body-parser"
import * as http from "http";
import * as https from "https";
import { FirstBytes } from "./firstBytes";

const app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.get("/downloadFile", (req, res) => {
    if(req.query.url == null || req.query.url == "") {
        res.status(404).json({error: "No URL given"});
        return;
    }

    let url : string = String(req.query.url);

    let responseCallback = (response : http.IncomingMessage) => {

        if(response.statusCode == 301 || response.statusCode == 302) {
            let redirectURL  = `${req.protocol}://${req.get('host')}/downloadFile?url=${response.headers.location}`;
            res.redirect(redirectURL);
            return;
        }

        let status = res.status(response.statusCode)
        status.set(response.headers);
        response.pipe(status);
    }


    let headersToSend = req.headers;
    delete headersToSend.host;
    delete headersToSend.cookie;
    headersToSend["user-agent"] = "'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:79.0) Gecko/20100101 Firefox/79.0'";
    headersToSend.accept = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8";
    console.log(headersToSend);
    try {
        if(url.startsWith("http://")) {
            http.get(url, { headers: headersToSend }, responseCallback);
            return;
        }

        if(url.startsWith("https://")) {
            https.get(url, { headers: headersToSend }, responseCallback);
            return;
        }


        res.status(400).json({error: "Invalid url protocol"});
    } catch (e) {
        console.log("Error", e.stack);
        res.status(500).json({error: e.stack});
    }

})

app.listen(8080, () => {
    console.log("Listening!");
});