"use strict";
exports.__esModule = true;
var express = require("express");
var bodyParser = require("body-parser");
var http = require("http");
var https = require("https");
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get("/downloadFile", function (req, res) {
    if (req.query.url == null || req.query.url == "") {
        res.status(404).json({ error: "No URL given" });
        return;
    }
    var url = String(req.query.url);
    var responseCallback = function (response) {
        if (response.statusCode == 301 || response.statusCode == 302) {
            var redirectURL = req.protocol + "://" + req.get('host') + "/downloadFile?url=" + response.headers.location;
            res.redirect(redirectURL);
            return;
        }
        var status = res.status(response.statusCode);
        status.set(response.headers);
        response.pipe(status);
    };
    var headersToSend = req.headers;
    delete headersToSend.host;
    delete headersToSend.cookie;
    headersToSend["user-agent"] = "'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:79.0) Gecko/20100101 Firefox/79.0'";
    headersToSend.accept = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8";
    console.log(headersToSend);
    try {
        if (url.startsWith("http://")) {
            http.get(url, { headers: headersToSend }, responseCallback);
            return;
        }
        if (url.startsWith("https://")) {
            https.get(url, { headers: headersToSend }, responseCallback);
            return;
        }
        res.status(400).json({ error: "Invalid url protocol" });
    }
    catch (e) {
        console.log("Error", e.stack);
        res.status(500).json({ error: e.stack });
    }
});
app.listen(8080, function () {
    console.log("Listening!");
});
//# sourceMappingURL=server.js.map