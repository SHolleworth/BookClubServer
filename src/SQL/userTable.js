"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToUserObject = void 0;
var getConnection = require('./connection').getConnection;
var bcrypt = require('bcrypt');
var SALT_ROUNDS = 10;
var insertUser = function (user, connection) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                if (!connection)
                    connection = getConnection();
                if (connection) {
                    var username_1 = user.username, password_1 = user.password;
                    try {
                        connection.query("SELECT * FROM User WHERE username = ?", [username_1], function (error, result, fields) {
                            if (error)
                                return reject("Error searching for existing user: " + error);
                            if (result.length)
                                return resolve("That username already exists.");
                            hashPassword(password_1)
                                .then(function (_a) {
                                var hash = _a.hash, salt = _a.salt;
                                return insertUserSQL(connection, username_1, hash, salt);
                            })
                                .then(function (result) {
                                return resolve(result);
                            })
                                .catch(function (error) {
                                return reject("Error hashing password: " + error);
                            });
                        });
                    }
                    catch (error) {
                        console.log("SQL query error " + error.code + ".");
                    }
                }
                else {
                    return reject("Error during user insertion, not connected to Database.");
                }
            })];
    });
}); };
var retrieveUser = function (userToRetrieve, connection) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                if (!connection)
                    connection = getConnection();
                if (connection) {
                    try {
                        connection.query('SELECT * FROM User WHERE username = ?', [userToRetrieve.username], function (error, results) {
                            if (error)
                                return reject("Error retrieving user " + userToRetrieve.username + " data: " + error);
                            if (results.length > 1)
                                return reject("Error, more than 1 user with name " + userToRetrieve.username + " found.");
                            var hash = results[0].password;
                            bcrypt.compare(userToRetrieve.password, hash, function (err, result) {
                                if (err)
                                    return reject("Error comparing passwords: " + err);
                                if (result) {
                                    var user = { id: results[0].id, username: results[0].username };
                                    console.log("Retrieved user.");
                                    console.log({ user: user });
                                    return resolve(user);
                                }
                            });
                        });
                    }
                    catch (error) {
                        console.error(error);
                    }
                }
                else {
                    return reject("Error during user insertion, not connected to Database.");
                }
            })];
    });
}); };
var hashPassword = function (password) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                bcrypt.genSalt(SALT_ROUNDS, function (err, salt) {
                    if (err)
                        return reject("Error generating salt: " + err);
                    bcrypt.hash(password, salt, function (err, hash) {
                        if (err)
                            return reject("Error hashing password: " + err);
                        return resolve({ hash: hash, salt: salt });
                    });
                });
            })];
    });
}); };
var insertUserSQL = function (connection, username, hashedPassword, salt) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                var user = { username: username, salt: salt, password: "" };
                user.password = hashedPassword;
                try {
                    connection.query("INSERT INTO User SET ?", user, function (error) {
                        if (error)
                            return reject("Error inserting user into database: " + error);
                        return resolve("User " + username + " added to database.");
                    });
                }
                catch (error) {
                    console.error(error);
                }
            })];
    });
}); };
exports.convertToUserObject = function (userData) {
    return { id: userData.id, username: userData.username };
};
module.exports = { insertUser: insertUser, retrieveUser: retrieveUser };
