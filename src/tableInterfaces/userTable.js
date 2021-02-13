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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToUserObject = void 0;
var bcrypt = require('bcrypt');
var database_1 = __importDefault(require("../database"));
var SALT_ROUNDS = 10;
var insertUser = function (user) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var connection, username, password, user_1, _a, hash, salt, message, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            connection = new database_1.default();
                            username = user.username, password = user.password;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 6, , 7]);
                            return [4 /*yield*/, connection.getPoolConnection()];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, connection.query("SELECT * FROM User WHERE username = ?", [username])];
                        case 3:
                            user_1 = _b.sent();
                            if (user_1.length)
                                return [2 /*return*/, resolve("That username already exists.")];
                            return [4 /*yield*/, hashPassword(password)];
                        case 4:
                            _a = _b.sent(), hash = _a.hash, salt = _a.salt;
                            return [4 /*yield*/, insertUserSQL(connection, username, hash, salt)];
                        case 5:
                            message = _b.sent();
                            connection.release();
                            return [2 /*return*/, resolve(message)];
                        case 6:
                            error_1 = _b.sent();
                            connection.release();
                            return [2 /*return*/, reject(error_1)];
                        case 7: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
var retrieveUser = function (userToRetrieve) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var connection, existingUsers_1, hash, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            connection = new database_1.default();
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, connection.getPoolConnection()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, connection.query('SELECT * FROM User WHERE username = ?', [userToRetrieve.username])];
                        case 3:
                            existingUsers_1 = _a.sent();
                            if (existingUsers_1.length > 1) {
                                connection.release();
                                return [2 /*return*/, reject("Error, more than 1 user with name " + userToRetrieve.username + " found.")];
                            }
                            hash = existingUsers_1[0].password;
                            bcrypt.compare(userToRetrieve.password, hash, function (err, result) {
                                if (err) {
                                    connection.release();
                                    return reject("Error comparing passwords: " + err);
                                }
                                if (result) {
                                    var user = { id: existingUsers_1[0].id, username: existingUsers_1[0].username };
                                    return resolve(user);
                                }
                                else {
                                    connection.release();
                                    return resolve("Incorrect Password");
                                }
                            });
                            return [3 /*break*/, 5];
                        case 4:
                            error_2 = _a.sent();
                            connection.release();
                            return [2 /*return*/, reject(error_2)];
                        case 5: return [2 /*return*/];
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
var insertUserSQL = function (connection, username, hashedPassword, salt) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var user, error_3;
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
                            connection.release();
                            return [2 /*return*/, resolve("User " + username + " added to database.")];
                        case 3:
                            error_3 = _a.sent();
                            connection.release();
                            return [2 /*return*/, reject(error_3)];
                        case 4: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
exports.convertToUserObject = function (userData) {
    return { id: userData.id, username: userData.username };
};
module.exports = { insertUser: insertUser, retrieveUser: retrieveUser };
