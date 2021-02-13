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
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var port = 3000;
var io = require('socket.io')(server);
var fs = require('fs');
var searchGoogleBooksByTitle = require('./requestHandler').searchGoogleBooksByTitle;
var _a = require('./SQL/bookTable'), insertBook = _a.insertBook, retrieveBooksOfShelves = _a.retrieveBooksOfShelves;
var _b = require('./SQL/connection'), configureConnectionPool = _b.configureConnectionPool, getConnection = _b.getConnection;
var _c = require('./SQL/shelfTable'), insertShelf = _c.insertShelf, retrieveShelvesOfUser = _c.retrieveShelvesOfUser;
var _d = require('./SQL/userTable'), insertUser = _d.insertUser, retrieveUser = _d.retrieveUser;
var clubTables_1 = require("./SQL/clubTables");
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
        socket.on('search_google_books_by_title', function (query) {
            searchGoogleBooksByTitle(query, apiKey)
                .then(function (response) {
                socket.emit('google_books_by_title_response', response);
            })
                .catch(function (error) {
                socket.emit('google_books_by_title_error', error);
            });
        });
        //New user registration
        socket.on('register_new_user', function (user) {
            insertUser(user)
                .then(function (response) {
                socket.emit('register_new_user_response', response);
            })
                .catch(function (error) {
                socket.emit('register_new_user_error', error);
            });
        });
        //User login request
        socket.on('login_as_user', function (user) { return __awaiter(void 0, void 0, void 0, function () {
            var userData, connection, _a, _b, _c, error_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        userData = { user: { id: null, username: null }, shelves: [], books: [] };
                        connection = getConnection();
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 5, , 6]);
                        _a = userData;
                        return [4 /*yield*/, retrieveUser(user, connection)];
                    case 2:
                        _a.user = _d.sent();
                        _b = userData;
                        return [4 /*yield*/, retrieveShelvesOfUser(userData.user, connection)];
                    case 3:
                        _b.shelves = _d.sent();
                        _c = userData;
                        return [4 /*yield*/, retrieveBooksOfShelves(userData.shelves, connection)];
                    case 4:
                        _c.books = _d.sent();
                        console.log("User logging on: " + userData.user.username);
                        socket.emit('login_as_user_response', userData);
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _d.sent();
                        socket.emit('login_as_user_error', error_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        //New shelf to add to database
        socket.on('post_new_shelf', function (shelf) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                insertShelf(shelf)
                    .then(function (results) {
                    socket.emit('post_new_shelf_response', results);
                })
                    .catch(function (error) {
                    socket.emit('post_new_shelf_error', error);
                });
                return [2 /*return*/];
            });
        }); });
        //Retrieve shelves of user
        socket.on('retrieve_shelves', function (user) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                retrieveShelvesOfUser(user)
                    .then(function (shelves) {
                    socket.emit('retrieve_shelves_response', shelves);
                })
                    .catch(function (error) {
                    socket.emit('retrieve_shelves_error', error);
                });
                return [2 /*return*/];
            });
        }); });
        //New book to add to database
        socket.on('post_new_book', function (book) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                insertBook(book)
                    .then(function (results) {
                    socket.emit('post_new_book_response', results);
                })
                    .catch(function (error) {
                    socket.emit('post_new_book_error', error);
                });
                return [2 /*return*/];
            });
        }); });
        //Retrieve books of user
        socket.on('retrieve_books', function (user) { return __awaiter(void 0, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                data = { shelves: [], books: [] };
                retrieveShelvesOfUser(user)
                    .then(function (shelves) {
                    data.shelves = shelves;
                    return retrieveBooksOfShelves(shelves);
                })
                    .then(function (books) {
                    data.books = books;
                    socket.emit('retrieve_books_response', data);
                })
                    .catch(function (error) {
                    socket.emit('retrieve_books_error', error);
                });
                return [2 /*return*/];
            });
        }); });
        //Post new club
        socket.on('post_new_club', function (clubData) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                clubTables_1.insertClub(clubData, null)
                    .then(function (results) {
                    socket.emit('post_new_club_response', results);
                })
                    .catch(function (error) {
                    socket.emit('post_new_club_error', error);
                });
                return [2 /*return*/];
            });
        }); });
        //Retrieve clubs of user
        socket.on('retrieve_clubs', function (user) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("Retrieving clubs for user: " + user.id);
                clubTables_1.retrieveClubs(user, null)
                    .then(function (clubs) {
                    socket.emit('retrieve_clubs_response', clubs);
                })
                    .catch(function (error) {
                    socket.emit('retrieve_clubs_error', error);
                });
                return [2 /*return*/];
            });
        }); });
    });
});
