"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var database_1 = __importDefault(require("../database"));
var insertBook = function (book) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var connection, existingBooks, insertBookResult, bookInfo, message, error_1, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!book.info.authors) {
                                book.info.authors = [""];
                            }
                            connection = new database_1.default();
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 8, , 13]);
                            return [4 /*yield*/, connection.getPoolConnection()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, connection.beginTransaction()];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, connection.query('SELECT * FROM Book WHERE id = ?', [book.id])];
                        case 4:
                            existingBooks = _a.sent();
                            if (existingBooks.length)
                                return [2 /*return*/, reject("Error, book with id " + book.id + " already in database.")];
                            return [4 /*yield*/, connection.query('INSERT INTO Book (volumeId, shelfId) VALUES (?, ?)', [book.volumeId, book.shelfId])];
                        case 5:
                            insertBookResult = _a.sent();
                            bookInfo = __assign(__assign({}, book.info), { authors: book.info.authors.toString(), bookId: insertBookResult.insertId });
                            return [4 /*yield*/, connection.query('INSERT INTO BookInfo SET ?', [bookInfo])];
                        case 6:
                            _a.sent();
                            return [4 /*yield*/, connection.commit()];
                        case 7:
                            _a.sent();
                            connection.release();
                            message = "Added book and info to database.";
                            console.log(message);
                            return [2 /*return*/, resolve(message)];
                        case 8:
                            error_1 = _a.sent();
                            _a.label = 9;
                        case 9:
                            _a.trys.push([9, 11, , 12]);
                            return [4 /*yield*/, connection.rollback()];
                        case 10:
                            _a.sent();
                            connection.release();
                            console.error(error_1);
                            return [2 /*return*/, reject(error_1)];
                        case 11:
                            error_2 = _a.sent();
                            connection.release();
                            console.error(error_2);
                            return [2 /*return*/, reject(error_2)];
                        case 12: return [3 /*break*/, 13];
                        case 13: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
var retrieveBooksOfShelves = function (shelves) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var message, books, connection, books_1, shelfIds, booksWithInfo, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            message = function (books) { return "Retrieved " + books.length + " books."; };
                            books = [];
                            if (!shelves.length) {
                                console.log(message(books));
                                return [2 /*return*/, resolve(books)];
                            }
                            connection = new database_1.default();
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 7, , 8]);
                            return [4 /*yield*/, connection.getPoolConnection()];
                        case 2:
                            _a.sent();
                            books_1 = [];
                            shelfIds = shelves.map(function (shelf) { return shelf.id; });
                            return [4 /*yield*/, connection.query('SELECT * FROM Book WHERE shelfId IN (?)', [shelfIds])];
                        case 3:
                            books_1 = _a.sent();
                            if (!books_1.length) return [3 /*break*/, 5];
                            return [4 /*yield*/, retrieveAndAppendBookInfo(books_1, connection)];
                        case 4:
                            booksWithInfo = _a.sent();
                            connection.release();
                            console.log(message(booksWithInfo));
                            return [2 /*return*/, resolve(booksWithInfo)];
                        case 5:
                            connection.release();
                            console.log(message(books_1));
                            return [2 /*return*/, resolve(books_1)];
                        case 6: return [3 /*break*/, 8];
                        case 7:
                            error_3 = _a.sent();
                            connection.release();
                            console.error(error_3);
                            return [2 /*return*/, reject(error_3)];
                        case 8: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
var retrieveAndAppendBookInfo = function (books, connection) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var bookIds, bookInfo_1, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            bookIds = books.map(function (book) { return book.id; });
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, connection.query('SELECT * FROM BookInfo WHERE bookId IN (?)', [bookIds])];
                        case 2:
                            bookInfo_1 = _a.sent();
                            return [2 /*return*/, resolve(books.map(function (book, i) {
                                    book.info = bookInfo_1[i];
                                    if (bookInfo_1[i].authors.includes(',')) {
                                        book.info.authors = bookInfo_1[i].authors.split(',');
                                    }
                                    else {
                                        book.info.authors = [bookInfo_1[i].authors];
                                    }
                                    return book;
                                }))];
                        case 3:
                            error_4 = _a.sent();
                            return [2 /*return*/, reject(error_4)];
                        case 4: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
module.exports = { insertBook: insertBook, retrieveBooksOfShelves: retrieveBooksOfShelves };
