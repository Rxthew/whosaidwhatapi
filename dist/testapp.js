"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleAuthTestVariable = exports.isAuthenticated = void 0;
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const http_errors_1 = __importDefault(require("http-errors"));
const method_override_1 = __importDefault(require("method-override"));
const morgan_1 = __importDefault(require("morgan"));
const admin_1 = __importDefault(require("./routes/admin"));
const comment_1 = __importDefault(require("./routes/comment"));
const index_1 = __importDefault(require("./routes/index"));
const login_1 = __importDefault(require("./routes/login"));
const post_1 = __importDefault(require("./routes/post"));
const signup_1 = __importDefault(require("./routes/signup"));
const user_1 = __importDefault(require("./routes/user"));
const app = (0, express_1.default)();
app.use((0, method_override_1.default)("_method"));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
const authTestSetup = function () {
  const _authTestVariable = {
    authenticated: true,
    member_status: "privileged",
  };
  const toggleAuthTestVariable = function (
    authenticate = true,
    new_member_status = "privileged"
  ) {
    Object.assign(_authTestVariable, {
      authenticated: authenticate,
      member_status: new_member_status,
    });
    return _authTestVariable;
  };
  const isAuthenticated = function (req, res, next) {
    const isAuth = function () {
      return _authTestVariable.authenticated;
    };
    Object.assign(req, { isAuthenticated: isAuth });
    Object.assign(req, {
      user: {
        username: "Jane Doe",
        member_status: _authTestVariable.member_status,
        _id: "200",
      },
    });
    next();
  };
  return {
    isAuthenticated,
    toggleAuthTestVariable,
  };
};
(_a = authTestSetup()),
  (exports.isAuthenticated = _a.isAuthenticated),
  (exports.toggleAuthTestVariable = _a.toggleAuthTestVariable);
app.use("/", [exports.isAuthenticated, index_1.default]);
app.use("/admin", admin_1.default);
app.use("/user", user_1.default);
app.use("/login", login_1.default);
app.use("/post", post_1.default);
app.use("/signup", signup_1.default);
app.use("/comment", comment_1.default);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next((0, http_errors_1.default)(404));
});
// error handler
app.use(function (err, req, res, _next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
exports.default = app;
