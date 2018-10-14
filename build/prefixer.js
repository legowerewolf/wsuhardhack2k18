"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INFO = 0;
exports.WARN = 1;
exports.ERROR = 2;
exports.ERROR_LEVEL_PREFIXES = ["[INFO]  ", "[WARN]  ", "[ERROR] "];
exports.Prefixer = getNewPrefixer();
function getNewPrefixer() {
    return {
        maxLength: 0,
        log: function (name, message) {
            console.log(this.compose(name, message));
        },
        compose: function (name, message) {
            let prefix = "[" + name + "]";
            prefix += " ".repeat(this.maxLength - prefix.length);
            return prefix + message;
        },
        prepare: function (name) {
            if (name.length + 3 > this.maxLength) {
                this.maxLength = name.length + 3;
            }
        }
    };
}
exports.getNewPrefixer = getNewPrefixer;
