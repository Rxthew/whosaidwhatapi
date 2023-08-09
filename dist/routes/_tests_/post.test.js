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
const mongoose_1 = __importDefault(require("mongoose"));
const supertest_1 = __importDefault(require("supertest"));
const comment_1 = require("../../models/comment");
const post_1 = require("../../models/post");
const user_1 = require("../../models/user");
const testapp_1 = __importStar(require("../../testapp"));
jest.mock("../../models/comment");
jest.mock("../../models/post");
jest.mock("../../models/user");
jest.mock("mongoose", () => {
    const actualModule = jest.requireActual("mongoose");
    return {
        __esModule: true,
        default: {
            ...actualModule,
            connection: {
                transaction: (write) => {
                    return Promise.resolve(write());
                },
            },
        },
    };
});
const generateMocks = function () {
    const mockCreate = jest.fn().mockImplementation(() => {
        return Promise.resolve(true);
    });
    const mockDeleteOne = jest.fn().mockImplementation(() => {
        return Promise.resolve(true);
    });
    const mockDeleteMany = jest.fn().mockImplementation(() => {
        return Promise.resolve(true);
    });
    const mockFindById = jest.fn().mockImplementation(() => {
        return Promise.resolve({ user: "200" });
    });
    const mockPostExists = jest.fn().mockImplementation(() => {
        return Promise.resolve(true);
    });
    const mockUpdateOne = jest.fn().mockImplementation(() => {
        return Promise.resolve();
    });
    const mockUserExists = jest
        .fn()
        .mockImplementation(() => Promise.resolve(true));
    return {
        mockCreate,
        mockDeleteOne,
        mockDeleteMany,
        mockFindById,
        mockPostExists,
        mockUpdateOne,
        mockUserExists,
    };
};
const checkIfErrorsPresent = function (res) {
    if (!("errors" in res.body)) {
        throw new Error("Errors object not present");
    }
};
const { mockCreate, mockDeleteOne, mockDeleteMany, mockFindById, mockPostExists, mockUpdateOne, mockUserExists, } = generateMocks();
comment_1.Comment.deleteMany = mockDeleteMany;
post_1.Post.create = mockCreate;
post_1.Post.deleteOne = mockDeleteOne;
post_1.Post.exists = mockPostExists;
post_1.Post.findById = mockFindById;
post_1.Post.updateOne = mockUpdateOne;
user_1.User.exists = mockUserExists;
describe("Post creation should work if user authenticated user id is validated", () => {
    const userId = new mongoose_1.default.Types.ObjectId();
    beforeEach(() => {
        mockCreate.mockClear();
    });
    it("Post should not be created if user is not authenticated", (done) => {
        (0, testapp_1.toggleAuthTestVariable)(false, "admin");
        (0, supertest_1.default)(testapp_1.default)
            .post("/post")
            .set("Accept", "application/json")
            .send({ title: "test title", content: "test content", user: userId })
            .expect(checkIfErrorsPresent)
            .expect(400)
            .end(async (err, res) => {
            if (err) {
                return done(err);
            }
            expect(mockCreate).not.toHaveBeenCalled();
            done();
        });
    });
    it("Post should not be created if user member status is not admin", (done) => {
        (0, testapp_1.toggleAuthTestVariable)(true, "regular");
        (0, supertest_1.default)(testapp_1.default)
            .post("/post")
            .set("Accept", "application/json")
            .send({ title: "test title", content: "test content", user: userId })
            .expect(checkIfErrorsPresent)
            .expect(400)
            .end(async (err, res) => {
            if (err) {
                return done(err);
            }
            expect(mockCreate).not.toHaveBeenCalled();
            done();
        });
    });
    it("Post should not be created if user member status is not admin", (done) => {
        (0, testapp_1.toggleAuthTestVariable)(true, "privileged");
        (0, supertest_1.default)(testapp_1.default)
            .post("/post")
            .set("Accept", "application/json")
            .send({ title: "test title", content: "test content", user: userId })
            .expect(checkIfErrorsPresent)
            .expect(400)
            .end(async (err, res) => {
            if (err) {
                return done(err);
            }
            expect(mockCreate).not.toHaveBeenCalled();
            done();
        });
    });
    it("Post should not be created if content is whitespace", (done) => {
        (0, testapp_1.toggleAuthTestVariable)(true, "admin");
        (0, supertest_1.default)(testapp_1.default)
            .post("/post")
            .set("Accept", "application/json")
            .send({ title: "test title", content: "  ", user: userId })
            .expect(checkIfErrorsPresent)
            .expect(400)
            .end(async (err, res) => {
            if (err) {
                return done(err);
            }
            expect(mockCreate).not.toHaveBeenCalled();
            done();
        });
    });
    it("Post should not be created if content is empty", (done) => {
        (0, testapp_1.toggleAuthTestVariable)(true, "admin");
        (0, supertest_1.default)(testapp_1.default)
            .post("/post")
            .set("Accept", "application/json")
            .send({ title: "test title", content: "", user: userId })
            .expect(checkIfErrorsPresent)
            .expect(400)
            .end(async (err, res) => {
            if (err) {
                return done(err);
            }
            expect(mockCreate).not.toHaveBeenCalled();
            done();
        });
    });
    it("Post should not be created if title is whitespace", (done) => {
        (0, testapp_1.toggleAuthTestVariable)(true, "admin");
        (0, supertest_1.default)(testapp_1.default)
            .post("/post")
            .set("Accept", "application/json")
            .send({ title: "  ", content: "test content", user: userId })
            .expect(checkIfErrorsPresent)
            .expect(400)
            .end(async (err, res) => {
            if (err) {
                return done(err);
            }
            expect(mockCreate).not.toHaveBeenCalled();
            done();
        });
    });
    it("Post should not be created if title is empty", (done) => {
        (0, testapp_1.toggleAuthTestVariable)(true, "admin");
        (0, supertest_1.default)(testapp_1.default)
            .post("/post")
            .set("Accept", "application/json")
            .send({ title: "", content: "test content", user: userId })
            .expect(checkIfErrorsPresent)
            .expect(400)
            .end(async (err, res) => {
            if (err) {
                return done(err);
            }
            expect(mockCreate).not.toHaveBeenCalled();
            done();
        });
    });
    it("Post should not be created if user id is not in database", (done) => {
        (0, testapp_1.toggleAuthTestVariable)(true, "admin");
        mockUserExists.mockImplementationOnce(() => {
            Promise.resolve(false);
        });
        (0, supertest_1.default)(testapp_1.default)
            .post("/post")
            .set("Accept", "application/json")
            .send({ title: "test title", content: "test content", user: userId })
            .expect(checkIfErrorsPresent)
            .expect(400)
            .end(async (err, res) => {
            if (err) {
                return done(err);
            }
            expect(mockCreate).not.toHaveBeenCalled();
            done();
        });
    });
    it("Expect post creation to redirect to origin if origin header is supplied", (done) => {
        const origin = "http://127.0.0.1:3000";
        (0, testapp_1.toggleAuthTestVariable)(true, "admin");
        (0, supertest_1.default)(testapp_1.default)
            .post("/post")
            .set("Origin", origin)
            .set("Accept", "application/json")
            .send({ title: "test title", content: "test content", user: userId })
            .expect(302)
            .end(async (err, res) => {
            if (err) {
                return done(err);
            }
            expect(mockCreate).toHaveBeenCalled();
            done();
        });
    });
    it("Expect post creation to return an object with post created status if origin header is not present", (done) => {
        (0, testapp_1.toggleAuthTestVariable)(true, "admin");
        (0, supertest_1.default)(testapp_1.default)
            .post("/post")
            .set("Accept", "application/json")
            .send({ title: "test title", content: "test content", user: userId })
            .expect(200)
            .end(async (err, res) => {
            if (err) {
                return done(err);
            }
            expect(mockCreate).toHaveBeenCalled();
            expect(res.body).toHaveProperty("status", "Post created successfully.");
            done();
        });
    });
});
describe("Post delete should work if user authenticated and _id is validated", () => {
    const postId = new mongoose_1.default.Types.ObjectId();
    beforeEach(() => {
        mockDeleteOne.mockClear();
        mockFindById.mockClear();
    });
    it("Post should not be deleted if user is not authenticated", (done) => {
        (0, testapp_1.toggleAuthTestVariable)(false, "admin");
        (0, supertest_1.default)(testapp_1.default)
            .delete("/post")
            .set("Accept", "application/json")
            .send({ _id: postId })
            .expect(checkIfErrorsPresent)
            .expect(400)
            .end(async (err, res) => {
            if (err) {
                return done(err);
            }
            expect(mockDeleteOne).not.toHaveBeenCalled();
            done();
        });
    });
    it("Post should not be deleted if user member status is only regular", (done) => {
        (0, testapp_1.toggleAuthTestVariable)(true, "regular");
        (0, supertest_1.default)(testapp_1.default)
            .delete("/post")
            .set("Accept", "application/json")
            .send({ _id: postId })
            .expect(checkIfErrorsPresent)
            .expect(400)
            .end(async (err, res) => {
            if (err) {
                return done(err);
            }
            expect(mockDeleteOne).not.toHaveBeenCalled();
            done();
        });
    });
    it("Post should not be deleted if user member status is only privileged", (done) => {
        (0, testapp_1.toggleAuthTestVariable)(true, "privileged");
        (0, supertest_1.default)(testapp_1.default)
            .delete("/post")
            .set("Accept", "application/json")
            .send({ _id: postId })
            .expect(checkIfErrorsPresent)
            .expect(400)
            .end(async (err, res) => {
            if (err) {
                return done(err);
            }
            expect(mockDeleteOne).not.toHaveBeenCalled();
            done();
        });
    });
    it("Post should not be deleted if user is not the owner of the post.", (done) => {
        (0, testapp_1.toggleAuthTestVariable)(true, "admin");
        mockFindById.mockImplementationOnce(() => {
            return Promise.resolve({ user: "100" });
        });
        (0, supertest_1.default)(testapp_1.default)
            .delete("/post")
            .set("Accept", "application/json")
            .send({ _id: postId })
            .expect(checkIfErrorsPresent)
            .expect(400)
            .end(async (err, res) => {
            if (err) {
                return done(err);
            }
            expect(mockDeleteOne).not.toHaveBeenCalled();
            done();
        });
    });
    it("Expect post delete to redirect to origin if Origin header is supplied", (done) => {
        const origin = "http://127.0.0.1:3000";
        (0, testapp_1.toggleAuthTestVariable)(true, "admin");
        (0, supertest_1.default)(testapp_1.default)
            .delete("/post")
            .set("Origin", origin)
            .set("Accept", "application/json")
            .send({ _id: postId })
            .expect(302)
            .end(async (err, res) => {
            if (err) {
                return done(err);
            }
            expect(mockDeleteOne).toHaveBeenCalled();
            done();
        });
    });
    it("Expect Post deletion to return an object with Post deleted status if origin header is not present", (done) => {
        (0, testapp_1.toggleAuthTestVariable)(true, "admin");
        (0, supertest_1.default)(testapp_1.default)
            .delete("/post")
            .set("Accept", "application/json")
            .send({ _id: postId })
            .expect(200)
            .end(async (err, res) => {
            if (err) {
                return done(err);
            }
            expect(mockDeleteOne).toHaveBeenCalled();
            expect(res.body).toHaveProperty("status", "Post deleted successfully.");
            done();
        });
    });
});
describe("Post update should work if user authenticated and _id is validated", () => {
    const postId = new mongoose_1.default.Types.ObjectId();
    const userId = new mongoose_1.default.Types.ObjectId();
    beforeEach(() => {
        mockUpdateOne.mockClear();
        mockFindById.mockClear();
    });
    it("Post should not be updated if user is not authenticated", (done) => {
        (0, testapp_1.toggleAuthTestVariable)(false);
        (0, supertest_1.default)(testapp_1.default)
            .put("/post")
            .set("Accept", "application/json")
            .send({
            _id: postId,
            title: "test title",
            content: "test content",
            user: userId,
        })
            .expect(checkIfErrorsPresent)
            .expect(400)
            .end(async (err, res) => {
            if (err) {
                return done(err);
            }
            expect(mockUpdateOne).not.toHaveBeenCalled();
            done();
        });
    });
    it("Post should not be updated if user member status is only regular", (done) => {
        (0, testapp_1.toggleAuthTestVariable)(true, "regular");
        (0, supertest_1.default)(testapp_1.default)
            .put("/post")
            .set("Accept", "application/json")
            .send({
            _id: postId,
            title: "test title",
            content: "test content",
            user: userId,
        })
            .expect(checkIfErrorsPresent)
            .expect(400)
            .end(async (err, res) => {
            if (err) {
                return done(err);
            }
            expect(mockUpdateOne).not.toHaveBeenCalled();
            done();
        });
    });
    it("Post should not be updated if _id is not in database", (done) => {
        (0, testapp_1.toggleAuthTestVariable)(true, "admin");
        mockUserExists.mockImplementationOnce(() => {
            Promise.resolve(false);
        });
        (0, supertest_1.default)(testapp_1.default)
            .put("/post")
            .set("Accept", "application/json")
            .send({
            _id: postId,
            title: "test title",
            content: "test content",
            user: userId,
        })
            .expect(checkIfErrorsPresent)
            .expect(400)
            .end(async (err, res) => {
            if (err) {
                return done(err);
            }
            expect(mockUpdateOne).not.toHaveBeenCalled();
            done();
        });
    });
    it("Post should not be updated if user is not the owner of the Post.", (done) => {
        (0, testapp_1.toggleAuthTestVariable)(true, "admin");
        mockFindById.mockImplementationOnce(() => {
            return Promise.resolve({ user: "100" });
        });
        (0, supertest_1.default)(testapp_1.default)
            .put("/post")
            .set("Accept", "application/json")
            .send({
            _id: postId,
            title: "test title",
            content: "test content",
            user: userId,
        })
            .expect(checkIfErrorsPresent)
            .expect(400)
            .end(async (err, res) => {
            if (err) {
                return done(err);
            }
            expect(mockUpdateOne).not.toHaveBeenCalled();
            done();
        });
    });
    it("Expect Post update to redirect to origin if origin header is supplied", (done) => {
        const origin = "http://127.0.0.1:3000";
        (0, testapp_1.toggleAuthTestVariable)(true, "admin");
        (0, supertest_1.default)(testapp_1.default)
            .put("/post")
            .set("Origin", origin)
            .set("Accept", "application/json")
            .send({
            _id: postId,
            title: "test title",
            content: "test content",
            user: userId,
        })
            .expect(302)
            .end(async (err, res) => {
            if (err) {
                return done(err);
            }
            expect(mockUpdateOne).toHaveBeenCalled();
            done();
        });
    });
    it("Expect Post update to return an object with Post updated status if origin header is not present", (done) => {
        (0, testapp_1.toggleAuthTestVariable)(true, "admin");
        (0, supertest_1.default)(testapp_1.default)
            .put("/post")
            .set("Accept", "application/json")
            .send({
            _id: postId,
            title: "test title",
            content: "test content",
            user: userId,
        })
            .expect(200)
            .end(async (err, res) => {
            if (err) {
                return done(err);
            }
            expect(mockUpdateOne).toHaveBeenCalled();
            expect(res.body).toHaveProperty("status", "Post updated successfully.");
            done();
        });
    });
});
