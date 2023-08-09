"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const testapp_1 = __importStar(require("../../testapp"));
const post_1 = require("../../models/post");
jest.mock("../../models/post");
const generateMocks = function () {
    const mockFind = jest.fn(() => {
        return {
            populate: (obj) => {
                return {
                    exec: () => {
                        return {
                            comment_author: obj.select.includes("user")
                                ? "visible"
                                : "anonymous",
                        };
                    },
                };
            },
        };
    });
    return {
        mockFind,
    };
};
const { mockFind } = generateMocks();
post_1.Post.find = mockFind;
describe("index call should return user and visible users for comments where authenticated, else just posts with comments", () => {
    it('Authenticated: Expect dummy user object in response body"', (done) => {
        (0, testapp_1.toggleAuthTestVariable)(true);
        (0, supertest_1.default)(testapp_1.default)
            .get("/")
            .set("Accept", "application/json")
            .expect(200)
            .end(async (err, res) => {
            if (err) {
                return await done(err);
            }
            expect(res.body).toHaveProperty("user.username", "Jane Doe");
            expect(res.body).toHaveProperty("user.member_status", "privileged");
            expect(res.body).toHaveProperty("user._id", "200");
            await done();
        });
    });
    it("Authenticated: Expect user (for comments) to be selected as part of query", (done) => {
        (0, testapp_1.toggleAuthTestVariable)(true);
        (0, supertest_1.default)(testapp_1.default)
            .get("/")
            .set("Accept", "application/json")
            .expect(200)
            .end(async (err, res) => {
            if (err) {
                return await done(err);
            }
            expect(res.body).toHaveProperty("posts.comment_author", "visible");
            await done();
        });
    });
    it("Not authenticated: Expect dummy user object to be absent from response body", (done) => {
        (0, testapp_1.toggleAuthTestVariable)(false);
        (0, supertest_1.default)(testapp_1.default)
            .get("/")
            .set("Accept", "application/json")
            .expect(200)
            .end(async (err, res) => {
            if (err) {
                return await done(err);
            }
            expect(res.body).not.toHaveProperty("user");
            await done();
        });
    });
    it("Not authenticated: Expect user (for comments) not to be selected as part of query", (done) => {
        (0, testapp_1.toggleAuthTestVariable)(false);
        (0, supertest_1.default)(testapp_1.default)
            .get("/")
            .set("Accept", "application/json")
            .expect(200)
            .end(async (err, res) => {
            if (err) {
                return await done(err);
            }
            expect(res.body).toHaveProperty("posts.comment_author", "anonymous");
            await done();
        });
    });
});
