"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutController = void 0;
//Note: reason I am nullifying the sessionID is because of race conditions in express
//session where the touch method is sometimes invoked after the destroy method thereby
//producing an error. Nullifying the sessionID prevents the touch method from being
//invoked in the first place.
const confirmLogout = function (req, res, next) {
  res.json({ status: "Logout successful." });
};
const nullifySessionId = function (req, res, next) {
  req.sessionID ? Object.assign(req, { sessionID: null }) : false;
  next();
};
const logout = function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      throw err;
    }
  });
  next();
};
exports.logoutController = [nullifySessionId, logout, confirmLogout];
