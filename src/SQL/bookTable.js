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
Object.defineProperty(exports, "__esModule", { value: true });
var getConnection = require('./connection').getConnection;
var insertBook = function (book, pool) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                //Request pool from connection if none supplied
                if (!pool)
                    pool = getConnection();
                pool.getConnection(function (err, connection) {
                    if (err)
                        return reject(err);
                    connection.beginTransaction(function (error) {
                        if (error)
                            return reject(error);
                        connection.query('SELECT * FROM Book WHERE id = ?', [book.id], function (error, results) {
                            if (error) {
                                return connection.rollback(function () {
                                    return reject(error);
                                });
                            }
                            if (results.length)
                                return reject("Error, book with id " + book.id + " already in database.");
                            connection.query('INSERT INTO Book (volumeId, shelfId) VALUES (?, ?)', [book.volumeId, book.shelfId], function (error, results) {
                                if (error) {
                                    return connection.rollback(function () {
                                        return reject("Error adding book: " + error);
                                    });
                                }
                                var bookInfo = __assign(__assign({}, book.info), { authors: book.info.authors.toString(), bookId: results.insertId });
                                connection.query('INSERT INTO BookInfo SET ?', bookInfo, function (error, results) {
                                    if (error) {
                                        return connection.rollback(function () {
                                            return reject("Error adding book info: " + error);
                                        });
                                    }
                                    console.log("Inserted book info.");
                                    connection.commit(function (error) {
                                        if (error) {
                                            return connection.rollback(function () {
                                                return reject("Error commiting book insertion: " + error);
                                            });
                                        }
                                        return resolve(results);
                                    });
                                });
                            });
                        });
                    });
                });
            })];
    });
}); };
var retrieveBooksOfShelves = function (shelves, connection) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                //Request connection from pool if none supplied
                if (!connection)
                    connection = getConnection();
                var books = [];
                if (!shelves.length) {
                    console.log("No books to retrieve.");
                    return resolve(books);
                }
                if (shelves.length === 1) {
                    connection.query('SELECT * FROM Book WHERE shelfId = ?', [shelves[0].id], function (error, results) {
                        if (error)
                            return reject("Error loading books for shelf " + shelves[0].name + ": " + error);
                        console.log("Retrieved books for single shelf.");
                        books = results;
                        retrieveAndAppendBookInfo(books, connection)
                            .then(function (books) {
                            return resolve(books);
                        })
                            .catch(function (error) {
                            return reject(error);
                        });
                    });
                }
                var shelfIds = shelves.map(function (shelf) { return shelf.id; });
                connection.query('SELECT * FROM Book WHERE shelfId IN (?)', [shelfIds], function (error, results) {
                    if (error)
                        return reject("Error loading books: " + error + ".");
                    console.log("Retrieved books.");
                    books = results;
                    if (books.length) {
                        retrieveAndAppendBookInfo(books, connection)
                            .then(function (booksWithInfo) {
                            return resolve(booksWithInfo);
                        })
                            .catch(function (error) {
                            return reject(error);
                        });
                    }
                    else {
                        return resolve(books);
                    }
                });
            })];
    });
}); };
var retrieveAndAppendBookInfo = function (books, connection) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                //Request connection from pool if none supplied
                if (!connection)
                    connection = getConnection();
                var bookIds = books.map(function (book) { return book.id; });
                connection.query('SELECT * FROM BookInfo WHERE bookId IN (?)', [bookIds], function (error, results) {
                    if (error)
                        return reject("Error loading book data: " + error);
                    console.log("Retrieved book info.");
                    return resolve(books.map(function (book, i) {
                        book.info = results[i];
                        if (results[i].authors.includes(',')) {
                            book.info.authors = results[i].authors.split(',');
                        }
                        else {
                            book.info.authors = [results[i].authors];
                        }
                        return book;
                    }));
                });
            })];
    });
}); };
module.exports = { insertBook: insertBook, retrieveBooksOfShelves: retrieveBooksOfShelves };
