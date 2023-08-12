"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userExistsInDatabase = exports.returnIndexData = exports.postExistsInDatabase = exports.noDuplicateUsernames = exports.hashPassword = exports.generateDate = exports.getUser = exports.checkUserIsAuthenticated = exports.checkValidityOfUserId = exports.checkValidityOfPostId = exports.basicValidation = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_validator_1 = require("express-validator");
const luxon_1 = require("luxon");
const mongoose_1 = __importDefault(require("mongoose"));
const post_1 = require("../../models/post");
const user_1 = require("../../models/user");
const _basicPostRequestFailed = function (res, errors) {
    const passedErrors = { errors: errors.mapped() };
    res.status(400).json(passedErrors);
    return;
};
const basicValidation = function (req, res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    const checkEmpty = errors.isEmpty();
    checkEmpty ? next() : false;
    return checkEmpty || _basicPostRequestFailed(res, errors);
};
exports.basicValidation = basicValidation;
const checkValidityOfPostId = function (id) {
    const result = mongoose_1.default.isObjectIdOrHexString(id);
    const postError = () => {
        throw new Error("Post's object id is invalid.");
    };
    return result || postError();
};
exports.checkValidityOfPostId = checkValidityOfPostId;
const checkValidityOfUserId = function (id) {
    const result = mongoose_1.default.isObjectIdOrHexString(id);
    const userError = () => {
        throw new Error("User's object id is invalid.");
    };
    return result || userError();
};
exports.checkValidityOfUserId = checkValidityOfUserId;
const checkUserIsAuthenticated = function (req, res, next) {
    req.isAuthenticated()
        ? next()
        : res.status(400).json({ errors: { msg: "User is not authenticated" } });
};
exports.checkUserIsAuthenticated = checkUserIsAuthenticated;
const getUser = async function (req, res, next) {
    try {
        const filterUserData = function (auth) {
            const user = auth ? req.user : false;
            user
                ? Object.assign(req.body, {
                    user: {
                        username: user.username,
                        member_status: user.member_status,
                        _id: user._id,
                    },
                })
                : false;
            next();
            return true;
        };
        req.isAuthenticated() ? filterUserData(req.isAuthenticated()) : next();
    }
    catch (error) {
        throw error;
    }
};
exports.getUser = getUser;
const generateDate = function () {
    return luxon_1.DateTime.utc().toISO();
};
exports.generateDate = generateDate;
const hashPassword = async function (password) {
    try {
        const result = await bcryptjs_1.default.hash(password, 10);
        return result;
    }
    catch (error) {
        throw error;
    }
};
exports.hashPassword = hashPassword;
const noDuplicateUsernames = async function (username) {
    try {
        const user = await user_1.User.findOne({
            username: username,
        });
        return user
            ? Promise.reject("This username already exists. Try another one.")
            : Promise.resolve();
    }
    catch (error) {
        throw error;
    }
};
exports.noDuplicateUsernames = noDuplicateUsernames;
const postExistsInDatabase = async function (id) {
    const result = await post_1.Post.exists({ _id: id }).catch((err) => {
        throw err;
    });
    const postError = () => {
        throw new Error("Post object id is not in database");
    };
    return result || postError();
};
exports.postExistsInDatabase = postExistsInDatabase;
const returnIndexData = function (req, res, next) {
    const responseBody = { posts: req.body.posts };
    req.body.user ? Object.assign(responseBody, { user: req.body.user }) : false;
    res.json(responseBody);
};
exports.returnIndexData = returnIndexData;
const userExistsInDatabase = async function (id) {
    const result = await user_1.User.exists({ _id: id }).catch((err) => {
        throw err;
    });
    const userError = () => {
        throw new Error("User object id is not in database");
    };
    return result || userError();
};
exports.userExistsInDatabase = userExistsInDatabase;
