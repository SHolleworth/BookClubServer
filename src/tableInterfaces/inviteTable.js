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
var insertInvite = function (invite, connection) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log("Attempting to insert invite: ");
        console.log(invite);
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var invitedId, inviterId, clubId, exisitngInvite, result, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            invitedId = invite.invitedId, inviterId = invite.inviterId, clubId = invite.clubId;
                            return [4 /*yield*/, connection.query("SELECT * FROM ClubInvite WHERE invitedId = ? AND inviterId = ? AND clubId = ?", [invitedId, inviterId, clubId])];
                        case 1:
                            exisitngInvite = _a.sent();
                            if (exisitngInvite.length) {
                                return [2 /*return*/, reject("Error, invite already exists")];
                            }
                            return [4 /*yield*/, connection.query("INSERT INTO clubinvite SET ?", [invite])];
                        case 2:
                            result = _a.sent();
                            return [2 /*return*/, resolve(result.insertId)];
                        case 3:
                            error_1 = _a.sent();
                            console.error(error_1);
                            return [2 /*return*/, reject(error_1)];
                        case 4: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
var retrieveInvitesOfUser = function (user, connection) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log("Retrieving invites of user " + user.username + ".");
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var inviteData, invites, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, connection.query("SELECT * FROM clubinvite WHERE invitedId = ?", [user.id])];
                        case 1:
                            inviteData = _a.sent();
                            return [4 /*yield*/, Promise.all(inviteData.map(function (data) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                    return [2 /*return*/, retrieveInvite(data, connection)];
                                }); }); }))];
                        case 2:
                            invites = _a.sent();
                            console.log("Retrieved " + invites.length + " invites.");
                            return [2 /*return*/, resolve(invites)];
                        case 3:
                            error_2 = _a.sent();
                            console.error(error_2);
                            return [2 /*return*/, reject(error_2)];
                        case 4: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
var retrieveInvite = function (inviteData, connection) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var inviteId, userData, inviter, club, invite, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            inviteId = inviteData.id;
                            return [4 /*yield*/, connection.query("SELECT * FROM user WHERE id = ?", [inviteData.inviterId])];
                        case 1:
                            userData = _a.sent();
                            inviter = { id: userData[0].id, username: userData[0].username };
                            return [4 /*yield*/, connection.query("SELECT * FROM club WHERE id = ?", [inviteData.clubId])];
                        case 2:
                            club = _a.sent();
                            invite = { inviteId: inviteId, inviter: inviter, club: club[0] };
                            console.log("Retrieved invite to club " + invite.club.name + " from " + invite.inviter.username + ".");
                            return [2 /*return*/, resolve(invite)];
                        case 3:
                            error_3 = _a.sent();
                            console.error(error_3);
                            return [2 /*return*/, reject(error_3)];
                        case 4: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
var deleteInvite = function (invite, connection) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, connection.query("DELETE FROM clubinvite WHERE id = ?", [invite.inviteId])];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, resolve("Invite deleted.")];
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
module.exports = { insertInvite: insertInvite, retrieveInvitesOfUser: retrieveInvitesOfUser, deleteInvite: deleteInvite };
