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
var getConnection = require('./connection').getConnection;
exports.insertClub = function (clubData, pool) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                if (!pool)
                    pool = getConnection();
                if (pool) {
                    try {
                        console.log("Inserting new club.");
                        pool.getConnection(function (error, connection) {
                            if (error)
                                return reject(error);
                            connection.beginTransaction(function (error) {
                                if (error)
                                    return reject(error);
                                connection.query('INSERT INTO Club (name) VALUES (?)', [clubData.name], function (error, results) {
                                    if (error) {
                                        connection.rollback();
                                        connection.release();
                                        return reject(error);
                                    }
                                    var clubId = results.insertId;
                                    var newClubMember = { userId: clubData.userId, clubId: clubId, admin: true };
                                    connection.query('INSERT INTO ClubMember SET ?', [newClubMember], function (error) {
                                        if (error) {
                                            connection.rollback();
                                            connection.release();
                                            return reject(error);
                                        }
                                        connection.commit(function (error) {
                                            if (error) {
                                                connection.rollback();
                                                connection.release();
                                                return reject(error);
                                            }
                                            connection.release();
                                            return resolve("Successfully added club to database.");
                                        });
                                    });
                                });
                            });
                        });
                    }
                    catch (error) {
                        ("SQL error during club insertion: " + error);
                    }
                }
                else {
                    return reject("Error inserting club, not connected to database.");
                }
            })];
    });
}); };
exports.retrieveClubs = function (user, pool) {
    console.log("Inside retrieving clubs.");
    return new Promise(function (resolve, reject) {
        if (!pool)
            pool = getConnection();
        var clubDataBelongingToUser = [];
        var memberDataBelongingToClubs = [];
        var userDataBelongingToMembers = [];
        if (pool) {
            console.log("Connected to database.");
            try {
                pool.getConnection(function (error, connection) {
                    if (error)
                        return reject(error);
                    console.log("Acquired connection from pool");
                    connection.beginTransaction(function (error) {
                        if (error)
                            return reject(error);
                        console.log("Beginning transaction.");
                        connection.query('SELECT * FROM ClubMember WHERE userId = ?', [user.id], function (error, results) {
                            if (error) {
                                connection.rollback();
                                connection.release();
                                return reject(error);
                            }
                            var clubIdsOfUser = results.map(function (memberData) { return memberData.clubId; });
                            connection.query('SELECT * FROM Club WHERE id IN (?)', [clubIdsOfUser], function (error, results) {
                                if (error) {
                                    connection.rollback();
                                    connection.release();
                                    return reject(error);
                                }
                                console.log("Retrieved club data for user.");
                                clubDataBelongingToUser = results;
                                if (clubDataBelongingToUser.length < 1) {
                                    return resolve([]);
                                }
                                var clubIds = clubDataBelongingToUser.map(function (clubData) { return clubData.id; });
                                connection.query('SELECT * FROM ClubMember WHERE clubId IN (?)', [clubIds], function (error, results) {
                                    if (error) {
                                        connection.rollback();
                                        connection.release();
                                        return reject(error);
                                    }
                                    console.log("Retrieved member data.");
                                    memberDataBelongingToClubs = results;
                                    var memberIds = memberDataBelongingToClubs.map(function (memberData) { return memberData.userId; });
                                    connection.query('SELECT * FROM User WHERE id IN (?)', [memberIds], function (error, results) {
                                        if (error) {
                                            connection.rollback();
                                            connection.release();
                                            return reject(error);
                                        }
                                        userDataBelongingToMembers = results;
                                        var clubs = formatClubObjects(clubDataBelongingToUser, memberDataBelongingToClubs, userDataBelongingToMembers);
                                        connection.commit(function (error) {
                                            if (error) {
                                                connection.rollback();
                                                connection.release();
                                                return reject(error);
                                            }
                                            connection.release();
                                            return resolve(clubs);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            }
            catch (error) {
                return reject("SQL error during club insertion: " + error);
            }
        }
        else {
            return reject("Error inserting club, not connected to database.");
        }
    });
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
