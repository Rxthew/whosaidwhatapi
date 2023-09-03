"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const http_errors_1 = __importDefault(require("http-errors"));
const method_override_1 = __importDefault(require("method-override"));
const mongoose_1 = __importDefault(require("mongoose"));
const morgan_1 = __importDefault(require("morgan"));
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const user_1 = require("./models/user");
const comment_1 = __importDefault(require("./routes/comment"));
const admin_1 = __importDefault(require("./routes/admin"));
const index_1 = __importDefault(require("./routes/index"));
const login_1 = __importDefault(require("./routes/login"));
const logout_1 = __importDefault(require("./routes/logout"));
const post_1 = __importDefault(require("./routes/post"));
const signup_1 = __importDefault(require("./routes/signup"));
const user_2 = __importDefault(require("./routes/user"));
dotenv_1.default.config();
const username = process.env.username;
const password = process.env.password;
const applicableCORS =
  process.env.NODE_ENV === "production" && process.env.origin
    ? (0, cors_1.default)({ origin: process.env.origin, credentials: true })
    : (0, cors_1.default)({
        origin: "http://localhost:5173",
        credentials: true,
      });
const mongoDb = `mongodb+srv://${username}:${password}@cluster0.jsx1fwc.mongodb.net/?retryWrites=true&w=majority`;
mongoose_1.default.connect(mongoDb);
const db = mongoose_1.default.connection;
db.on("error", console.error.bind(console, "MongoDB failed connection"));
const app = (0, express_1.default)();
const secret = process.env.secret ?? "development_secret";
const sessionStore = connect_mongo_1.default.create({
  mongoUrl: mongoDb,
});
app.use(applicableCORS);
app.use(
  (0, express_session_1.default)({
    secret,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: false,
      secure: true,
    }
  })
);
passport_1.default.use(
  new passport_local_1.Strategy(async (username, password, done) => {
    try {
      const user = await user_1.User.findOne({
        username: username,
      });
      switch (true) {
        case !user:
          return done(null, false, {
            message: "Username or password is incorrect",
          });
        case !(await bcryptjs_1.default.compare(password, user.password)):
          return done(null, false, {
            message: "Username or password is incorrect",
          });
        default:
          return done(null, user);
      }
    } catch (err) {
      return done(err);
    }
  })
);
passport_1.default.serializeUser((user, done) => {
  done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
  try {
    const user = await user_1.User.findById(id);
    done(null, user);
  } catch (error) {
    return done(error);
  }
});
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use((0, method_override_1.default)("_method"));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use("/", index_1.default);
app.use("/admin", admin_1.default);
app.use("/user", user_2.default);
app.use("/login", login_1.default);
app.use("/logout", logout_1.default);
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
  console.log(err);
  res
    .status(err.status || 500)
    .json({ Message: `<<${err.message}>>`, "Full Error": `<<${err}>>` });
});
exports.default = app;
