"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function default_1() {
    this.question = function (question) {
        return new Promise(function (resolve, reject) {
            rl.question(question, function (input) {
                return resolve(input);
            });
        });
    };
}
exports.default = default_1;
