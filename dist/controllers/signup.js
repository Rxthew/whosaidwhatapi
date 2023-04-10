"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_validator_1 = require("express-validator");
const user_1 = require("../models/user");
const _hashPassword = async function (password) {
    try {
        const result = await bcryptjs_1.default.hash(password, 10);
        return result;
    }
    catch (error) {
        throw error;
    }
};
const _noDuplicateUsernames = async function (username) {
    try {
        const user = await user_1.User.findOne({
            username: username
        });
        return user ? Promise.reject('This username already exists. Try another one.') : Promise.resolve();
    }
    catch (error) {
        throw error;
    }
};
const _signUpFailed = function (res, errors) {
    const passedErrors = { errors: errors.mapped() };
    res.status(400).json(passedErrors);
    return;
};
const signUpValidation = function (req, res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    const checkEmpty = errors.isEmpty();
    if (checkEmpty) {
        next();
    }
    else {
        _signUpFailed(res, errors);
    }
};
const assignMembershipCode = function (req, res, next) {
    const adminMember = function () {
        if (req.body.admin_code && req.body.admin_code === '4321') {
            return Object.assign(req.body, { member_status: 'admin' });
        }
        return null;
    };
    const privilegedMember = function () {
        if (req.body.privilege_code && req.body.privilege_code === '1234') {
            return Object.assign(req.body, { member_status: 'privileged' });
        }
        return null;
    };
    const regularMember = function () {
        return Object.assign(req.body, { member_status: 'regular' });
    };
    adminMember() ?? privilegedMember() ?? regularMember();
    next();
};
const saveUser = async function (req, res, next) {
    try {
        const hashed = await _hashPassword(req.body.password);
        const user = new user_1.User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            password: hashed,
            member_status: req.body.member_status
        });
        await user.save();
    }
    catch (err) {
        console.log(err);
    }
    next();
};
const redirectPage = function (req, res, next) {
    const referer = req.get('Referer');
    if (referer) {
        res.redirect(referer);
    }
    else {
        res.json({ errors: {
                msg: 'Referer header is not set. Sign-up complete. Please go back to homepage.'
            } });
    }
};
const signUpController = [
    (0, express_validator_1.header)('Referer').exists()
        .withMessage('Referer header must not be empty.'),
    (0, express_validator_1.body)('first_name', 'First name must not be empty.')
        .trim()
        .isAlpha()
        .withMessage('Characters in this field must be from the alphabet.')
        .escape(),
    (0, express_validator_1.body)('last_name', 'Last name must not be empty')
        .trim()
        .isAlpha(undefined, { ignore: ' -' })
        .withMessage('Characters in this field must be from the alphabet or a hyphen.')
        .escape(),
    (0, express_validator_1.body)('username', 'username must not be empty')
        .trim()
        .escape(),
    (0, express_validator_1.body)('username').custom(_noDuplicateUsernames),
    (0, express_validator_1.body)('password', 'Password must not be empty')
        .trim()
        .isLength({ min: 8 })
        .withMessage('password needs to be a minimum of 8 characters')
        .escape(),
    (0, express_validator_1.body)('privilege_code')
        .optional({ checkFalsy: true })
        .trim()
        .equals('1234')
        .withMessage('passcode for privileged status is incorrect')
        .escape(),
    (0, express_validator_1.body)('admin_code')
        .optional({ checkFalsy: true })
        .trim()
        .equals('4321')
        .withMessage('passcode for admin status is incorrect')
        .escape(),
    signUpValidation,
    assignMembershipCode,
    saveUser,
    redirectPage,
];
exports.default = signUpController;
