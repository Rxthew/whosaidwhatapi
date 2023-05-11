"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const passport_1 = __importDefault(require("passport"));
const _loginValidationFailed = function (res, errors) {
    const passedErrors = { errors: errors.mapped() };
    res.status(400).json(passedErrors);
    return;
};
const _supplyReferer = function (req, res, next) {
    const referer = req.get('Referer');
    if (referer) {
        return referer;
    }
    else {
        res.json({ errors: {
                msg: 'Referer header is not set. Sign-up complete. Please go back to homepage.'
            } });
    }
};
const _supplyUserInfo = function (req, res, next) {
    const referer = _supplyReferer(req, res, next);
    if (req.user) {
        const user = Object.assign(req.user, { password: '' });
        res.json(user);
    }
    else if (referer) {
        res.redirect(referer);
    }
};
const authenticateUser = function (req, res, next) {
    const redirect = _supplyReferer(req, res, next);
    return passport_1.default.authenticate('local', { failureRedirect: redirect, failureMessage: true }, _supplyUserInfo)(req, res, next);
};
const loginValidation = function (req, res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    const checkEmpty = errors.isEmpty();
    if (checkEmpty) {
        next();
    }
    else {
        _loginValidationFailed(res, errors);
    }
};
const loginController = [
    (0, express_validator_1.header)('Referer').exists()
        .withMessage('Referer header must not be empty.'),
    (0, express_validator_1.body)('username', 'username must not be empty')
        .trim()
        .escape(),
    (0, express_validator_1.body)('password', 'Password must not be empty')
        .trim()
        .isLength({ min: 8 })
        .withMessage('password needs to be a minimum of 8 characters')
        .escape(),
    loginValidation,
    authenticateUser
];
exports.default = loginController;
