import { readFile } from "fs";
import { Board, Led, Sensor } from "johnny-five";
import { SMTPClient } from "./smtpclient";
import { Arguments, ConfigData } from "./types";

//Parse arguments
let args: any = { ...Arguments };
process.argv.forEach((argument) => {
    let sepIndex = argument.indexOf(":");
    if (sepIndex == -1) {
    } else if (Object.keys(Arguments).find(key => key == argument.substring(0, sepIndex)) != undefined) {
        args[argument.substring(0, sepIndex)] = argument.substr(sepIndex + 1);
    }
});

//Read the configuration
readFile("./config/config.json", (configErr, configDataRaw) => {
    if (configErr) {
        throw configErr;
    } else {
        let configData: ConfigData = JSON.parse(configDataRaw.toString());
        configData.email.password = args.emailPassword;

        let client = new SMTPClient(configData.email.server, 587, configData.email.username, configData.email.password);

        //client.send(`Hello, user!`, "This is a test message.");

        //Set up the board
        let b = new Board({
            repl: false,
            debug: false
        });
        b.on("ready", () => {
            let leds: { [index: number]: Led } = {
                5: new Led(5), //Red LED
                6: new Led(6), //Green LED
                10: new Led(10), //Infrared LED 1
                11: new Led(11), //Infrared LED 2
                13: new Led(13) //Onboard LED
            }
            let recievers: { [index: number]: Sensor } = {
                0: new Sensor({ pin: "A0" }), //Infrared reciever 1
                1: new Sensor({ pin: 1, type: "digital" }), //Infrared reciever 2
            }

            let state: any = {
                primedBy: -1,
                countInRoom: 0,
                securityMode: false,
            }

            leds[10].on();
            leds[11].on();

            recievers[0].on("change", () => {
                if (state.primedBy == 1) {
                    state.countInRoom--;
                    state.primedBy = -1;
                    //console.log(`Count in room: ${state.countInRoom}`)
                } else {
                    state.primedBy = 0;
                }
            });
            recievers[1].on("change", () => {
                if (state.primedBy == 0) {
                    state.countInRoom++;
                    state.primedBy = -1;
                    //console.log(`Count in room: ${state.countInRoom}`)
                } else {
                    state.primedBy = 1;
                }
            })
            recievers[0].on("data", (data) => { console.log(data) })

            let x = setInterval(() => {
                state.securityMode = checkbetweentimes(configData.security.on, configData.security.off, getSimpleTime());

            }, 500);

            function sensor(i: number) {
                if (recievers[i].boolean) {
                    state.counts[i]++;
                    state.counts[1 - i]--;
                }
            }

        })
    }
});

function checkbetweentimes(start: number, stop: number, test: number): boolean {
    if (stop < start) {
        //day wrap
        return (start <= test && test < 24) || (0 <= test && test <= stop)
    } else {
        //in one day
        return start <= test && test <= stop
    }
}

function getSimpleTime(): number {
    let now = new Date(Date.now());
    return now.getHours() + (now.getMinutes() / 60) + (now.getSeconds() / 3600);
}
