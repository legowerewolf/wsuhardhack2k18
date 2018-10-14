import { readFile } from "fs";
import { SMTPClient } from "./smtpclient";
import { Arguments, ConfigData } from "./types";

let args: any = { ...Arguments };
process.argv.forEach((argument) => {
    let sepIndex = argument.indexOf(":");
    if (sepIndex == -1) {
    } else if (Object.keys(Arguments).find(key => key == argument.substring(0, sepIndex)) != undefined) {
        args[argument.substring(0, sepIndex)] = argument.substr(sepIndex + 1);
    }
});

readFile("./config/config.json", (configErr, configDataRaw) => {
    if (configErr) {
        throw configErr;
    } else {
        let configData: ConfigData = JSON.parse(configDataRaw.toString());
        configData.email.password = args.emailPassword;

        let client = new SMTPClient(configData.email.server, 587, configData.email.username, configData.email.password);

        client.send(`Hello, user!`, "This is a test message.");
    }
});

