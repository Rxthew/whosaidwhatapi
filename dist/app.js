"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const http_errors_1 = __importDefault(require("http-errors"));
const method_override_1 = __importDefault(require("method-override"));
const mongoose_1 = __importDefault(require("mongoose"));
const morgan_1 = __importDefault(require("morgan"));
const index_1 = __importDefault(require("./routes/index"));
dotenv_1.default.config();
const username = process.env.username;
const password = process.env.password;
const applicableCORS = process.env.NODE_ENV === 'production' && process.env.origin ? (0, cors_1.default)() : (0, cors_1.default)({ origin: process.env.origin });
const mongoDb = `mongodb+srv://${username}:${password}@cluster0.jsx1fwc.mongodb.net/?retryWrites=true&w=majority`;
mongoose_1.default.connect(mongoDb);
const db = mongoose_1.default.connection;
db.on('error', console.error.bind(console, "MongoDB failed connection"));
const app = (0, express_1.default)();
app.use(applicableCORS);
app.use((0, method_override_1.default)('_method'));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use('/', index_1.default);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next((0, http_errors_1.default)(404));
});
// error handler
app.use(function (err, req, res, _next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
exports.default = app;
