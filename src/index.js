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
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var port = 3000;
var io = require('socket.io')(server);
var fs = require('fs');
var searchGoogleBooksByTitle = require('./requestHandler').searchGoogleBooksByTitle;
var _a = require('./tableInterfaces/bookTable'), insertBook = _a.insertBook, retrieveBooksOfShelves = _a.retrieveBooksOfShelves;
var _b = require('./tableInterfaces/connection'), configureConnectionPool = _b.configureConnectionPool, getPool = _b.getPool;
var _c = require('./tableInterfaces/shelfTable'), insertShelf = _c.insertShelf, retrieveShelvesOfUser = _c.retrieveShelvesOfUser;
var _d = require('./tableInterfaces/userTable'), insertUser = _d.insertUser, retrieveUser = _d.retrieveUser;
var clubTables_1 = require("./tableInterfaces/clubTables");
var database_1 = __importDefault(require("./database"));
fs.readFile('../apiKey.txt', 'utf8', function (err, data) {
    if (err)
        throw err;
    var apiKey = data;
    console.log("API key acquired.");
    server.listen(port, function () {
        console.log("Listening on port " + port);
    });
    configureConnectionPool();
    io.on('connection', function (socket) {
        console.log("Client connected");
        //Search bar query from client
        socket.on('search_google_books_by_title', function (query) { return __awaiter(void 0, void 0, void 0, function () {
            var volumeData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, searchGoogleBooksByTitle(query, apiKey)];
                    case 1:
                        volumeData = _a.sent();
                        socket.emit('google_books_by_title_response', volumeData);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        socket.emit('google_books_by_title_error', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        //New user registration
        socket.on('register_new_user', function (user) { return __awaiter(void 0, void 0, void 0, function () {
            var connection, message, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        connection = new database_1.default();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, connection.getPoolConnection()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, insertUser(user, connection)];
                    case 3:
                        message = _a.sent();
                        socket.emit('register_new_user_response', message);
                        return [3 /*break*/, 6];
                    case 4:
                        error_2 = _a.sent();
                        socket.emit('register_new_user_error', error_2);
                        return [3 /*break*/, 6];
                    case 5:
                        connection.release();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        //User login request
        socket.on('login_as_user', function (user) { return __awaiter(void 0, void 0, void 0, function () {
            var userData, connection, _a, _b, _c, _d, error_3;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        userData = { user: { id: null, username: null }, shelves: [], books: [], clubs: [] };
                        connection = new database_1.default();
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 7, 8, 9]);
                        return [4 /*yield*/, connection.getPoolConnection()];
                    case 2:
                        _e.sent();
                        _a = userData;
                        return [4 /*yield*/, retrieveUser(user, connection)];
                    case 3:
                        _a.user = _e.sent();
                        _b = userData;
                        return [4 /*yield*/, retrieveShelvesOfUser(userData.user, connection)];
                    case 4:
                        _b.shelves = _e.sent();
                        _c = userData;
                        return [4 /*yield*/, retrieveBooksOfShelves(userData.shelves, connection)];
                    case 5:
                        _c.books = _e.sent();
                        _d = userData;
                        return [4 /*yield*/, clubTables_1.retrieveClubs(userData.user, connection)];
                    case 6:
                        _d.clubs = _e.sent();
                        console.log("User logging on: " + userData.user.username);
                        socket.emit('login_as_user_response', userData);
                        return [3 /*break*/, 9];
                    case 7:
                        error_3 = _e.sent();
                        socket.emit('login_as_user_error', error_3);
                        return [3 /*break*/, 9];
                    case 8:
                        connection.release();
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        }); });
        //New shelf to add to database
        socket.on('post_new_shelf', function (shelf) { return __awaiter(void 0, void 0, void 0, function () {
            var connection, message, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        connection = new database_1.default();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, connection.getPoolConnection()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, insertShelf(shelf, connection)];
                    case 3:
                        message = _a.sent();
                        socket.emit('post_new_shelf_response', message);
                        return [3 /*break*/, 6];
                    case 4:
                        error_4 = _a.sent();
                        socket.emit('post_new_shelf_error', error_4);
                        return [3 /*break*/, 6];
                    case 5:
                        connection.release();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        //Retrieve shelves of user
        socket.on('retrieve_shelves', function (user) { return __awaiter(void 0, void 0, void 0, function () {
            var connection, shelves, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        connection = new database_1.default();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, connection.getPoolConnection()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, retrieveShelvesOfUser(user, connection)];
                    case 3:
                        shelves = _a.sent();
                        socket.emit('retrieve_shelves_response', shelves);
                        return [3 /*break*/, 6];
                    case 4:
                        error_5 = _a.sent();
                        socket.emit('retrieve_shelves_error', error_5);
                        return [3 /*break*/, 6];
                    case 5:
                        connection.release();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        //New book to add to database
        socket.on('post_new_book', function (book) { return __awaiter(void 0, void 0, void 0, function () {
            var connection, message, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        connection = new database_1.default();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, connection.getPoolConnection()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, insertBook(book, connection)];
                    case 3:
                        message = _a.sent();
                        socket.emit('post_new_book_response', message);
                        return [3 /*break*/, 6];
                    case 4:
                        error_6 = _a.sent();
                        socket.emit('post_new_book_error', error_6);
                        return [3 /*break*/, 6];
                    case 5:
                        connection.release();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        //Retrieve books of user
        socket.on('retrieve_books', function (user) { return __awaiter(void 0, void 0, void 0, function () {
            var data, connection, _a, _b, error_7;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        data = { shelves: [], books: [] };
                        connection = new database_1.default();
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 5, 6, 7]);
                        return [4 /*yield*/, connection.getPoolConnection()];
                    case 2:
                        _c.sent();
                        _a = data;
                        return [4 /*yield*/, retrieveShelvesOfUser(user, connection)];
                    case 3:
                        _a.shelves = _c.sent();
                        _b = data;
                        return [4 /*yield*/, retrieveBooksOfShelves(data.shelves, connection)];
                    case 4:
                        _b.books = _c.sent();
                        socket.emit('retrieve_books_response', data);
                        return [3 /*break*/, 7];
                    case 5:
                        error_7 = _c.sent();
                        socket.emit('retrieve_books_error', error_7);
                        return [3 /*break*/, 7];
                    case 6:
                        connection.release();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        //Post new club
        socket.on('post_new_club', function (clubData) { return __awaiter(void 0, void 0, void 0, function () {
            var connection, message, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        connection = new database_1.default();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, connection.getPoolConnection()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, clubTables_1.insertClub(clubData, connection)];
                    case 3:
                        message = _a.sent();
                        socket.emit('post_new_club_response', message);
                        return [3 /*break*/, 6];
                    case 4:
                        error_8 = _a.sent();
                        socket.emit('post_new_club_error', error_8);
                        return [3 /*break*/, 6];
                    case 5:
                        connection.release();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        //Retrieve clubs of user
        socket.on('retrieve_clubs', function (user) { return __awaiter(void 0, void 0, void 0, function () {
            var connection, clubs, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Retrieving clubs for user: " + user.id);
                        connection = new database_1.default();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, connection.getPoolConnection()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, clubTables_1.retrieveClubs(user, connection)];
                    case 3:
                        clubs = _a.sent();
                        socket.emit('retrieve_clubs_response', clubs);
                        return [3 /*break*/, 6];
                    case 4:
                        error_9 = _a.sent();
                        socket.emit('retrieve_clubs_error', error_9);
                        return [3 /*break*/, 6];
                    case 5:
                        connection.release();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
    });
});
