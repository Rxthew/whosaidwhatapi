"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const testapp_1 = __importDefault(require("../../testapp"));
jest.mock("passport", () => ({
    __esModule: true,
    default: {
        authenticate: () => {
            return (req, res, next) => {
                res.json({ test: "authenticated" });
            };
        },
    },
}));
describe("Login should call authenticate when passing validation, else it should redirect or return errors.", () => {
    it("Valid credentials should call authentication", (done) => {
        (0, supertest_1.default)(testapp_1.default)
            .post("/login")
            .set("Origin", "http://localhost:3000")
            .set("Accept", "application/json")
            .send({ username: "janedoe", password: "janedoe1" })
            .expect(200)
            .end(async (err, res) => {
            if (err) {
                return done(err);
            }
            expect(res.body).toEqual({ test: "authenticated" });
            done();
        });
    });
});
