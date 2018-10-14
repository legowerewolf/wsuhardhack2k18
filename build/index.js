"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const smtpclient_1 = require("./smtpclient");
const types_1 = require("./types");
let args = Object.assign({}, types_1.Arguments);
process.argv.forEach((argument) => {
    let sepIndex = argument.indexOf(":");
    if (sepIndex == -1) {
    }
    else if (Object.keys(types_1.Arguments).find(key => key == argument.substring(0, sepIndex)) != undefined) {
        args[argument.substring(0, sepIndex)] = argument.substr(sepIndex + 1);
    }
});
fs_1.readFile("./config/config.json", (configErr, configDataRaw) => {
    if (configErr) {
        throw configErr;
    }
    else {
        let configData = JSON.parse(configDataRaw.toString());
        configData.email.password = args.emailPassword;
        let client = new smtpclient_1.SMTPClient(configData.email.server, 587, configData.email.username, configData.email.password);
        client.send(`Hello, user!`, "This is a test message.");
    }
});
