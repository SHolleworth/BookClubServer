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
var bcrypt = require('bcrypt');
var SALT_ROUNDS = 10;
var updateSocketIdOfUser = function (userId, socketId, connection) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log("Adding socket ID: " + socketId + " to user ID: " + userId + ".");
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var error, message, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            if (!userId) {
                                error = "Null user Id on socket Id update.";
                                console.error(error);
                                return [2 /*return*/, reject(error)];
                            }
                            return [4 /*yield*/, connection.query("UPDATE user SET socketId = ? WHERE id = ?", [socketId, userId])];
                        case 1:
                            _a.sent();
                            message = "Successfully updated socket ID. New socket ID: " + socketId;
                            console.log(message);
                            return [2 /*return*/, resolve(message)];
                        case 2:
                            error_1 = _a.sent();
                            console.error(error_1);
                            return [2 /*return*/, reject(error_1)];
                        case 3: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
var insertUser = function (user, connection) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log("Attempting to insert user: " + user.username);
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var username, password, user_1, _a, hash, salt, message, error_2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            username = user.username, password = user.password;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 5, , 6]);
                            return [4 /*yield*/, connection.query("SELECT * FROM User WHERE username = ?", [username])];
                        case 2:
                            user_1 = _b.sent();
                            if (user_1.length) {
                                return [2 /*return*/, reject("That username already exists.")];
                            }
                            return [4 /*yield*/, hashPassword(password)];
                        case 3:
                            _a = _b.sent(), hash = _a.hash, salt = _a.salt;
                            return [4 /*yield*/, insertUserSQL(username, hash, salt, connection)];
                        case 4:
                            message = _b.sent();
                            console.log("Inserted user: " + user_1.username);
                            return [2 /*return*/, resolve(message)];
                        case 5:
                            error_2 = _b.sent();
                            console.error(error_2);
                            return [2 /*return*/, reject(error_2)];
                        case 6: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
var retrieveUser = function (userToRetrieve, connection) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log("Attempting to retrieve user: " + userToRetrieve.username);
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var existingUsers_1, error, error, hash, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, connection.query('SELECT * FROM User WHERE username = ?', [userToRetrieve.username])];
                        case 1:
                            existingUsers_1 = _a.sent();
                            if (existingUsers_1.length > 1) {
                                error = "Error, more than 1 user with name " + userToRetrieve.username + " found.";
                                console.error(error);
                                return [2 /*return*/, reject(error)];
                            }
                            if (existingUsers_1.length < 1) {
                                error = "Error, no user found with username: " + userToRetrieve.username + ".";
                                console.error(error);
                                return [2 /*return*/, reject(error)];
                            }
                            hash = existingUsers_1[0].password;
                            bcrypt.compare(userToRetrieve.password, hash, function (err, result) {
                                if (err) {
                                    var error = "Error comparing passwords: " + err;
                                    console.error(error);
                                    return reject(error);
                                }
                                if (result) {
                                    var user = { id: existingUsers_1[0].id, username: existingUsers_1[0].username };
                                    console.log("Retrieved user: " + user.username);
                                    return resolve(user);
                                }
                                else {
                                    var error = "Incorrect Password";
                                    console.error(error);
                                    return reject(error);
                                }
                            });
                            return [3 /*break*/, 3];
                        case 2:
                            error_3 = _a.sent();
                            console.error(error_3);
                            return [2 /*return*/, reject(error_3)];
                        case 3: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
var retrieveUserIdAndSocketIdByUsername = function (username, connection) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log("Attempting to retrieve user Id and socket Id of : " + username);
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var user, data, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, connection.query("SELECT * FROM User WHERE username = ?", [username])];
                        case 1:
                            user = _a.sent();
                            if (user.length < 1) {
                                return [2 /*return*/, reject("Username not found.")];
                            }
                            if (user.length > 1) {
                                return [2 /*return*/, reject("Error, more than one user with username " + username + " found, aborting.")];
                            }
                            data = { id: user[0].id, socketId: user[0].socketId };
                            return [2 /*return*/, resolve(data)];
                        case 2:
                            error_4 = _a.sent();
                            console.error(error_4);
                            return [2 /*return*/, reject(error_4)];
                        case 3: return [2 /*return*/];
                    }
                });
            }); })];
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
var insertUserSQL = function (username, hashedPassword, salt, connection) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var user, message, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            user = { username: username, salt: salt, password: "" };
                            user.password = hashedPassword;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, connection.query("INSERT INTO User SET ?", [user])];
                        case 2:
                            _a.sent();
                            message = "User " + username + " added to database.";
                            console.log(message);
                            return [2 /*return*/, resolve(message)];
                        case 3:
                            error_5 = _a.sent();
                            console.error(error_5);
                            return [2 /*return*/, reject(error_5)];
                        case 4: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
exports.convertToUserObject = function (userData) {
    return { id: userData.id, username: userData.username };
};
module.exports = { insertUser: insertUser, retrieveUser: retrieveUser, updateSocketIdOfUser: updateSocketIdOfUser, retrieveUserIdAndSocketIdByUsername: retrieveUserIdAndSocketIdByUsername };
