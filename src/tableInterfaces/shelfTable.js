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
var insertShelf = function (shelf, connection) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var existingShelves, message, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.log("Inserting shelf " + shelf.name);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, connection.query('SELECT * FROM Shelf WHERE id = ?', [shelf.id])];
                        case 2:
                            existingShelves = _a.sent();
                            if (existingShelves.length)
                                return [2 /*return*/, reject("Error, shelf with id " + shelf.id + " already in database.")];
                            return [4 /*yield*/, connection.query('INSERT INTO Shelf (name, userId) VALUES (?, ?)', [shelf.name, shelf.userId])];
                        case 3:
                            _a.sent();
                            message = "Successfully added shelf to database.";
                            console.log(message);
                            return [2 /*return*/, resolve(message)];
                        case 4:
                            error_1 = _a.sent();
                            console.error(error_1);
                            return [2 /*return*/, reject(error_1)];
                        case 5: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
var deleteShelf = function (shelf, connection) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var bookDataFromShelf, message, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.log("Deleting shelf " + shelf.name);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 8, , 10]);
                            return [4 /*yield*/, connection.beginTransaction()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, connection.query("SELECT * FROM book WHERE shelfId = ?", [shelf.id])];
                        case 3:
                            bookDataFromShelf = _a.sent();
                            return [4 /*yield*/, Promise.all(bookDataFromShelf.map(function (bookData) { return __awaiter(void 0, void 0, void 0, function () {
                                    var error_3;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 2, , 3]);
                                                return [4 /*yield*/, connection.query("DELETE FROM bookinfo WHERE bookId = ?", [bookData.id])];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/, Promise.resolve(1)];
                                            case 2:
                                                error_3 = _a.sent();
                                                return [2 /*return*/, Promise.reject(error_3)];
                                            case 3: return [2 /*return*/];
                                        }
                                    });
                                }); }))];
                        case 4:
                            _a.sent();
                            return [4 /*yield*/, connection.query("DELETE FROM book WHERE shelfId = ?", [shelf.id])];
                        case 5:
                            _a.sent();
                            return [4 /*yield*/, connection.query("DELETE FROM shelf WHERE id = ?", [shelf.id])];
                        case 6:
                            _a.sent();
                            message = "Deleted shelf " + shelf.name + " and its contents.";
                            return [4 /*yield*/, connection.commit()];
                        case 7:
                            _a.sent();
                            console.log(message);
                            return [2 /*return*/, resolve(message)];
                        case 8:
                            error_2 = _a.sent();
                            return [4 /*yield*/, connection.rollback()];
                        case 9:
                            _a.sent();
                            console.error(error_2);
                            return [2 /*return*/, reject(error_2)];
                        case 10: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
var retrieveShelvesOfUser = function (user, connection) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var shelves, message, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, connection.query('SELECT * FROM Shelf WHERE userId = ?', [user.id])];
                        case 1:
                            shelves = _a.sent();
                            message = "Retrieved " + shelves.length + " shelves of user " + user.username + ".";
                            console.log(message);
                            return [2 /*return*/, resolve(shelves)];
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
module.exports = { insertShelf: insertShelf, deleteShelf: deleteShelf, retrieveShelvesOfUser: retrieveShelvesOfUser };
