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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveClubs = exports.insertClub = void 0;
exports.insertClub = function (clubData, connection) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var insertedClubRow, clubId, newClubMember, message, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.log("Attempting to insert club: " + clubData.name);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 6, , 8]);
                            return [4 /*yield*/, connection.beginTransaction()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, connection.query('INSERT INTO Club (name) VALUES (?)', [clubData.name])];
                        case 3:
                            insertedClubRow = _a.sent();
                            clubId = insertedClubRow.insertId;
                            newClubMember = { userId: clubData.userId, clubId: clubId, admin: true };
                            return [4 /*yield*/, connection.query('INSERT INTO ClubMember SET ?', [newClubMember])];
                        case 4:
                            _a.sent();
                            return [4 /*yield*/, connection.commit()];
                        case 5:
                            _a.sent();
                            message = "Successfully added club to database.";
                            console.log(message);
                            return [2 /*return*/, resolve(message)];
                        case 6:
                            error_1 = _a.sent();
                            return [4 /*yield*/, connection.rollback()];
                        case 7:
                            _a.sent();
                            console.error(error_1);
                            return [2 /*return*/, reject(error_1)];
                        case 8: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
exports.retrieveClubs = function (user, connection) {
    return new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
        var message, clubDataBelongingToUser, memberDataBelongingToClubs, userDataBelongingToMembers, memberDataOfUser, clubIdsOfUser, clubIds, memberIds, clubs, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Attempting to retrieve clubs of user: " + user.username);
                    message = function (clubs) { return "Retrieved " + clubs.length + " clubs of user: " + user.username; };
                    clubDataBelongingToUser = [];
                    memberDataBelongingToClubs = [];
                    userDataBelongingToMembers = [];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 10]);
                    return [4 /*yield*/, connection.beginTransaction()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, connection.query('SELECT * FROM ClubMember WHERE userId = ?', [user.id])];
                case 3:
                    memberDataOfUser = _a.sent();
                    clubIdsOfUser = memberDataOfUser.map(function (memberData) { return memberData.clubId; });
                    return [4 /*yield*/, connection.query('SELECT * FROM Club WHERE id IN (?)', [clubIdsOfUser])];
                case 4:
                    clubDataBelongingToUser = _a.sent();
                    if (clubDataBelongingToUser.length < 1) {
                        console.log(message([]));
                        return [2 /*return*/, resolve([])];
                    }
                    clubIds = clubDataBelongingToUser.map(function (clubData) { return clubData.id; });
                    return [4 /*yield*/, connection.query('SELECT * FROM ClubMember WHERE clubId IN (?)', [clubIds])];
                case 5:
                    memberDataBelongingToClubs = _a.sent();
                    memberIds = memberDataBelongingToClubs.map(function (memberData) { return memberData.userId; });
                    return [4 /*yield*/, connection.query('SELECT * FROM User WHERE id IN (?)', [memberIds])];
                case 6:
                    userDataBelongingToMembers = _a.sent();
                    clubs = formatClubObjects(clubDataBelongingToUser, memberDataBelongingToClubs, userDataBelongingToMembers);
                    return [4 /*yield*/, connection.commit()];
                case 7:
                    _a.sent();
                    console.log(message(clubs));
                    return [2 /*return*/, resolve(clubs)];
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
    }); });
};
var formatClubObjects = function (clubDataSet, memberDataSet, userDataSet) {
    return clubDataSet.map(function (clubData) {
        var memberDataOfThisClub = memberDataSet.filter(function (memberData) { return memberData.clubId === clubData.id; });
        var members = memberDataOfThisClub.map(function (memberData) {
            var memberUserData = userDataSet.find(function (userData) { return userData.id === memberData.userId; });
            if (memberUserData) {
                var user = { id: memberUserData.id, username: memberUserData.username };
                var member = { admin: memberData.admin, user: __assign({}, user) };
                return member;
            }
            return undefined;
        });
        var club = __assign(__assign({}, clubData), { members: __spreadArrays(members) });
        return club;
    });
};
