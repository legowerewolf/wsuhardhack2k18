"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const johnny_five_1 = require("johnny-five");
const smtpclient_1 = require("./smtpclient");
const types_1 = require("./types");
//Parse arguments
let args = Object.assign({}, types_1.Arguments);
process.argv.forEach((argument) => {
    let sepIndex = argument.indexOf(":");
    if (sepIndex == -1) {
    }
    else if (Object.keys(types_1.Arguments).find(key => key == argument.substring(0, sepIndex)) != undefined) {
        args[argument.substring(0, sepIndex)] = argument.substr(sepIndex + 1);
    }
});
//Read the configuration
fs_1.readFile("./config/config.json", (configErr, configDataRaw) => {
    if (configErr) {
        throw configErr;
    }
    else {
        let configData = JSON.parse(configDataRaw.toString());
        configData.email.password = args.emailPassword;
        let client = new smtpclient_1.SMTPClient(configData.email.server, 587, configData.email.username, configData.email.password);
        //client.send(`Hello, user!`, "This is a test message.");
        //Set up the board
        let b = new johnny_five_1.Board({
            repl: false,
            debug: false
        });
        b.on("ready", () => {
            let leds = {
                5: new johnny_five_1.Led(5),
                6: new johnny_five_1.Led(6),
                10: new johnny_five_1.Led(10),
                11: new johnny_five_1.Led(11),
                13: new johnny_five_1.Led(13) //Onboard LED
            };
            let recievers = {
                0: new johnny_five_1.Sensor({ pin: "A0" }),
                1: new johnny_five_1.Sensor({ pin: 1, type: "digital" }),
            };
            let state = {
                primedBy: -1,
                countInRoom: 0,
                securityMode: false,
            };
            leds[10].on();
            leds[11].on();
            recievers[0].on("change", () => {
                if (state.primedBy == 1) {
                    state.countInRoom--;
                    state.primedBy = -1;
                    //console.log(`Count in room: ${state.countInRoom}`)
                }
                else {
                    state.primedBy = 0;
                }
            });
            recievers[1].on("change", () => {
                if (state.primedBy == 0) {
                    state.countInRoom++;
                    state.primedBy = -1;
                    //console.log(`Count in room: ${state.countInRoom}`)
                }
                else {
                    state.primedBy = 1;
                }
            });
            recievers[0].on("data", (data) => { console.log(data); });
            let x = setInterval(() => {
                state.securityMode = checkbetweentimes(configData.security.on, configData.security.off, getSimpleTime());
            }, 500);
            function sensor(i) {
                if (recievers[i].boolean) {
                    state.counts[i]++;
                    state.counts[1 - i]--;
                }
            }
        });
    }
});
function checkbetweentimes(start, stop, test) {
    if (stop < start) {
        //day wrap
        return (start <= test && test < 24) || (0 <= test && test <= stop);
    }
    else {
        //in one day
        return start <= test && test <= stop;
    }
}
function getSimpleTime() {
    let now = new Date(Date.now());
    return now.getHours() + (now.getMinutes() / 60) + (now.getSeconds() / 3600);
}
