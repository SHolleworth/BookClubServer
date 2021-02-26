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
var _d = require('./tableInterfaces/userTable'), insertUser = _d.insertUser, retrieveUser = _d.retrieveUser, retrieveUserIdAndSocketIdByUsername = _d.retrieveUserIdAndSocketIdByUsername, updateSocketIdOfUser = _d.updateSocketIdOfUser;
var _e = require('./tableInterfaces/inviteTable'), insertInvite = _e.insertInvite, retrieveInvitesOfUser = _e.retrieveInvitesOfUser, deleteInvite = _e.deleteInvite;
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
        socket.on('update_socket_id', function (userId) { return __awaiter(void 0, void 0, void 0, function () {
            var connection, message, error_1;
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
                        return [4 /*yield*/, updateSocketIdOfUser(userId, socket.id, connection)];
                    case 3:
                        message = _a.sent();
                        socket.emit('update_socket_id_response', message);
                        return [3 /*break*/, 6];
                    case 4:
                        error_1 = _a.sent();
                        socket.emit('update_socket_id_error', error_1);
                        return [3 /*break*/, 6];
                    case 5:
                        connection.release();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        //Search bar query from client
        socket.on('search_google_books_by_title', function (query) { return __awaiter(void 0, void 0, void 0, function () {
            var volumeData, error_2;
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
                        error_2 = _a.sent();
                        socket.emit('google_books_by_title_error', error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        //New user registration
        socket.on('register_new_user', function (user) { return __awaiter(void 0, void 0, void 0, function () {
            var connection, message, error_3;
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
                        error_3 = _a.sent();
                        socket.emit('register_new_user_error', error_3);
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
            var userData, connection, _a, _b, _c, _d, _e, error_4;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        userData = {
                            user: { id: null, username: null },
                            shelves: [],
                            books: [],
                            clubs: [],
                            invites: []
                        };
                        connection = new database_1.default();
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 9, 10, 11]);
                        return [4 /*yield*/, connection.getPoolConnection()];
                    case 2:
                        _f.sent();
                        _a = userData;
                        return [4 /*yield*/, retrieveUser(user, connection)];
                    case 3:
                        _a.user = _f.sent();
                        _b = userData;
                        return [4 /*yield*/, retrieveShelvesOfUser(userData.user, connection)];
                    case 4:
                        _b.shelves = _f.sent();
                        _c = userData;
                        return [4 /*yield*/, retrieveBooksOfShelves(userData.shelves, connection)];
                    case 5:
                        _c.books = _f.sent();
                        _d = userData;
                        return [4 /*yield*/, clubTables_1.retrieveClubsOfUser(userData.user, connection, socket)];
                    case 6:
                        _d.clubs = _f.sent();
                        _e = userData;
                        return [4 /*yield*/, retrieveInvitesOfUser(userData.user, connection)];
                    case 7:
                        _e.invites = _f.sent();
                        return [4 /*yield*/, updateSocketIdOfUser(userData.user.id, socket.id, connection)];
                    case 8:
                        _f.sent();
                        console.log("User logging on: " + userData.user.username);
                        socket.emit('login_as_user_response', userData);
                        return [3 /*break*/, 11];
                    case 9:
                        error_4 = _f.sent();
                        socket.emit('login_as_user_error', error_4);
                        return [3 /*break*/, 11];
                    case 10:
                        connection.release();
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        }); });
        //New shelf to add to database
        socket.on('post_new_shelf', function (shelf) { return __awaiter(void 0, void 0, void 0, function () {
            var connection, message, error_5;
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
                        error_5 = _a.sent();
                        socket.emit('post_new_shelf_error', error_5);
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
            var connection, shelves, error_6;
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
                        error_6 = _a.sent();
                        socket.emit('retrieve_shelves_error', error_6);
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
            var connection, message, error_7;
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
                        error_7 = _a.sent();
                        socket.emit('post_new_book_error', error_7);
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
            var data, connection, _a, _b, error_8;
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
                        error_8 = _c.sent();
                        socket.emit('retrieve_books_error', error_8);
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
            var connection, message, error_9;
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
                        error_9 = _a.sent();
                        socket.emit('post_new_club_error', error_9);
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
            var connection, clubs, error_10;
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
                        return [4 /*yield*/, clubTables_1.retrieveClubsOfUser(user, connection, socket)];
                    case 3:
                        clubs = _a.sent();
                        socket.emit('retrieve_clubs_response', clubs);
                        return [3 /*break*/, 6];
                    case 4:
                        error_10 = _a.sent();
                        socket.emit('retrieve_clubs_error', error_10);
                        return [3 /*break*/, 6];
                    case 5:
                        connection.release();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        //Send club invite to username
        socket.on('send_club_invite', function (invite) { return __awaiter(void 0, void 0, void 0, function () {
            var invitedUsername, inviter, club, connection, _a, id, socketId, inviteData, inviteId, inviteToSend, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        invitedUsername = invite.invitedUsername, inviter = invite.inviter, club = invite.club;
                        console.log("Processing club invitation to club: " + club.name + ", sent from " + inviter.username + " to " + invitedUsername + ".");
                        connection = new database_1.default();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, 6, 7]);
                        return [4 /*yield*/, connection.getPoolConnection()];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, retrieveUserIdAndSocketIdByUsername(invitedUsername, connection)];
                    case 3:
                        _a = _b.sent(), id = _a.id, socketId = _a.socketId;
                        inviteData = { id: null, invitedId: id, inviterId: inviter.id, clubId: club.id };
                        return [4 /*yield*/, insertInvite(inviteData, connection)];
                    case 4:
                        inviteId = _b.sent();
                        inviteToSend = { inviter: inviter, club: club, inviteId: inviteId };
                        console.log("Sending invite to socket Id " + socketId);
                        io.to(socketId).emit('receiving_club_invite', inviteToSend);
                        socket.emit('send_club_invite_response', "Invite sent.");
                        return [3 /*break*/, 7];
                    case 5:
                        error_11 = _b.sent();
                        console.error(error_11);
                        socket.emit('send_club_invite_error', error_11);
                        return [3 /*break*/, 7];
                    case 6:
                        connection.release();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        socket.on('retrieve_club_invites', function (user) { return __awaiter(void 0, void 0, void 0, function () {
            var connection, invites, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Retrieving invites of " + user.username + ".");
                        connection = new database_1.default();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, connection.getPoolConnection()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, retrieveInvitesOfUser(user, connection)];
                    case 3:
                        invites = _a.sent();
                        console.log('Retrieved invites.');
                        socket.emit('retrieve_club_invites_response', invites);
                        return [3 /*break*/, 6];
                    case 4:
                        error_12 = _a.sent();
                        console.error(error_12);
                        socket.emit('retrieve_club_invites_error', error_12);
                        return [3 /*break*/, 6];
                    case 5:
                        connection.release();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        socket.on('delete_club_invite', function (invite) { return __awaiter(void 0, void 0, void 0, function () {
            var connection, message, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Deleting invite " + invite.inviteId + ".");
                        connection = new database_1.default();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, connection.getPoolConnection()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, deleteInvite(invite, connection)];
                    case 3:
                        message = _a.sent();
                        console.log(message);
                        socket.emit('delete_club_invite_response', message);
                        return [3 /*break*/, 6];
                    case 4:
                        error_13 = _a.sent();
                        console.error(error_13);
                        socket.emit('delete_club_invite_error', error_13);
                        return [3 /*break*/, 6];
                    case 5:
                        connection.release();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        //Add a club member
        socket.on('post_club_member', function (payload) { return __awaiter(void 0, void 0, void 0, function () {
            var _a, userId, clubId, connection, message, clubs, error_14;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = payload.memberData, userId = _a.userId, clubId = _a.clubId;
                        console.log("Adding user: " + userId + " to club: " + clubId + ".");
                        connection = new database_1.default();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, 6, 7]);
                        return [4 /*yield*/, connection.getPoolConnection()];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, clubTables_1.insertClubMember(payload, connection)];
                    case 3:
                        message = _b.sent();
                        return [4 /*yield*/, connection.query("SELECT * FROM club WHERE id = ?", [clubId])];
                    case 4:
                        clubs = _b.sent();
                        console.log("Sending club refresh signal.");
                        socket.to(clubs[0].name).emit("refresh_clubs");
                        socket.emit('post_club_member_response', message);
                        return [3 /*break*/, 7];
                    case 5:
                        error_14 = _b.sent();
                        console.error(error_14);
                        socket.emit('post_club_member_error', error_14);
                        return [3 /*break*/, 7];
                    case 6:
                        connection.release();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        socket.on('post_meeting', function (meeting) { return __awaiter(void 0, void 0, void 0, function () {
            var connection, message, club, error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        connection = new database_1.default();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, 6, 7]);
                        return [4 /*yield*/, connection.getPoolConnection()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, clubTables_1.insertMeeting(meeting, connection)];
                    case 3:
                        message = _a.sent();
                        socket.emit('post_meeting_response', message);
                        return [4 /*yield*/, connection.query("SELECT * FROM club WHERE id = ?", [meeting.clubId])];
                    case 4:
                        club = _a.sent();
                        io.to(club[0].name).emit('refresh_clubs');
                        return [3 /*break*/, 7];
                    case 5:
                        error_15 = _a.sent();
                        console.error(error_15);
                        socket.emit('post_meeting_error', error_15);
                        return [3 /*break*/, 7];
                    case 6:
                        connection.release();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
    });
});
