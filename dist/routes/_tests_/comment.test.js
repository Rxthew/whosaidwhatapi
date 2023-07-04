"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
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
const mockCreate = jest.fn();
const mockDeleteOne = jest.fn();
const mockUpdateOne = jest.fn();
comment_1.Comment.create = mockCreate.mockImplementation(() => {
  return Promise.resolve();
});
comment_1.Comment.deleteOne = mockDeleteOne.mockImplementation(() => {
  return Promise.resolve();
});
comment_1.Comment.updateOne = mockUpdateOne.mockImplementation(() => {
  return Promise.resolve();
});
const mockCommentExists = jest
  .fn()
  .mockImplementation(() => Promise.resolve(true));
const mockFindById = jest.fn().mockImplementation(() => {
  return Promise.resolve({ user: "200" });
});
const mockUserExists = jest
  .fn()
  .mockImplementation(() => Promise.resolve(true));
const mockPostExists = jest
  .fn()
  .mockImplementation(() => Promise.resolve(true));
comment_1.Comment.exists = mockCommentExists;
comment_1.Comment.findById = mockFindById;
post_1.Post.exists = mockPostExists;
user_1.User.exists = mockUserExists;
const checkIfErrorsPresent = function (res) {
  if (!("errors" in res.body)) {
    throw new Error("Errors object not present");
  }
};
const databaseMockGenerator = function (modelMockExists) {
  const databaseMockImplementation = function (fakeId) {
    return modelMockExists.mockImplementationOnce(function (idContainer) {
      if (fakeId) {
        const result = idContainer["_id"] === fakeId.toString();
        return Promise.resolve(result);
      }
      return fakeId;
    });
  };
  return databaseMockImplementation;
};
describe("Comment creation should work if user authenticated and post id and user id are validated", () => {
  const postId = new mongoose_1.default.Types.ObjectId();
  const userId = new mongoose_1.default.Types.ObjectId();
  beforeEach(() => {
    mockCreate.mockClear();
  });
  it("Comment should not be created if user is not authenticated", (done) => {
    (0, testapp_1.toggleAuthTestVariable)(false);
    (0, supertest_1.default)(testapp_1.default)
      .post("/comment")
      .set("Accept", "application/json")
      .send({ content: "test content", post: postId, user: userId })
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
  it("Comment should not be created if user member status is only regular (privileged or admin, a must)", (done) => {
    (0, testapp_1.toggleAuthTestVariable)(true, "regular");
    (0, supertest_1.default)(testapp_1.default)
      .post("/comment")
      .set("Accept", "application/json")
      .send({ content: "test content", post: postId, user: userId })
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
  it("Comment should not be created if content is whitespace", (done) => {
    (0, testapp_1.toggleAuthTestVariable)(true);
    (0, supertest_1.default)(testapp_1.default)
      .post("/comment")
      .set("Accept", "application/json")
      .send({ content: "  ", post: postId, user: userId })
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
  it("Comment should not be created if content is empty", (done) => {
    (0, testapp_1.toggleAuthTestVariable)(true);
    (0, supertest_1.default)(testapp_1.default)
      .post("/comment")
      .set("Accept", "application/json")
      .send({ content: "", post: postId, user: userId })
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
  it("Comment should not be created if post id is not in database", (done) => {
    (0, testapp_1.toggleAuthTestVariable)(true);
    databaseMockGenerator(mockPostExists)(
      new mongoose_1.default.Types.ObjectId()
    );
    (0, supertest_1.default)(testapp_1.default)
      .post("/comment")
      .set("Accept", "application/json")
      .send({ content: "test content", post: postId, user: userId })
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
  it("Comment should not be created if user id is not in database", (done) => {
    (0, testapp_1.toggleAuthTestVariable)(true);
    databaseMockGenerator(mockUserExists)(
      new mongoose_1.default.Types.ObjectId()
    );
    (0, supertest_1.default)(testapp_1.default)
      .post("/comment")
      .set("Accept", "application/json")
      .send({ content: "test content", post: postId, user: userId })
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
  it("Expect comment creation to redirect to origin if origin header is supplied", (done) => {
    const origin = "http://127.0.0.1:3000";
    (0, testapp_1.toggleAuthTestVariable)(true);
    databaseMockGenerator(mockPostExists)(postId);
    (0, supertest_1.default)(testapp_1.default)
      .post("/comment")
      .set("Origin", origin)
      .set("Accept", "application/json")
      .send({ content: "test content", post: postId, user: userId })
      .expect(302)
      .end(async (err, res) => {
        if (err) {
          return done(err);
        }
        expect(mockCreate).toHaveBeenCalled();
        done();
      });
  });
  it("Expect comment creation to return an object with comment created status if origin header is not present", (done) => {
    (0, testapp_1.toggleAuthTestVariable)(true);
    databaseMockGenerator(mockUserExists)(userId);
    (0, supertest_1.default)(testapp_1.default)
      .post("/comment")
      .set("Accept", "application/json")
      .send({ content: "test content", post: postId, user: userId })
      .expect(200)
      .end(async (err, res) => {
        if (err) {
          return done(err);
        }
        expect(mockCreate).toHaveBeenCalled();
        expect(res.body).toHaveProperty(
          "status",
          "Comment created successfully."
        );
        done();
      });
  });
});
describe("Comment delete should work if user authenticated and _id is validated", () => {
  const commentId = new mongoose_1.default.Types.ObjectId();
  beforeEach(() => {
    mockDeleteOne.mockClear();
    mockFindById.mockClear();
  });
  it("Comment should not be deleted if user is not authenticated", (done) => {
    (0, testapp_1.toggleAuthTestVariable)(false);
    (0, supertest_1.default)(testapp_1.default)
      .delete("/comment")
      .set("Accept", "application/json")
      .send({ _id: commentId })
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
  it("Comment should not be deleted if user member status is only regular (privileged or admin, a must)", (done) => {
    (0, testapp_1.toggleAuthTestVariable)(true, "regular");
    (0, supertest_1.default)(testapp_1.default)
      .delete("/comment")
      .set("Accept", "application/json")
      .send({ _id: commentId })
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
  it("Comment should not be deleted if user is not the owner of the comment.", (done) => {
    (0, testapp_1.toggleAuthTestVariable)(true);
    mockFindById.mockImplementationOnce(() => {
      return Promise.resolve({ user: "100" });
    });
    (0, supertest_1.default)(testapp_1.default)
      .delete("/comment")
      .set("Accept", "application/json")
      .send({ _id: commentId })
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
  it("Expect comment delete to redirect to origin if Origin header is supplied", (done) => {
    const origin = "http://127.0.0.1:3000";
    (0, testapp_1.toggleAuthTestVariable)(true);
    (0, supertest_1.default)(testapp_1.default)
      .delete("/comment")
      .set("Origin", origin)
      .set("Accept", "application/json")
      .send({ _id: commentId })
      .expect(302)
      .end(async (err, res) => {
        if (err) {
          return done(err);
        }
        expect(mockDeleteOne).toHaveBeenCalled();
        done();
      });
  });
  it("Expect comment deletion to return an object with comment deleted status if origin header is not present", (done) => {
    (0, testapp_1.toggleAuthTestVariable)(true);
    (0, supertest_1.default)(testapp_1.default)
      .delete("/comment")
      .set("Accept", "application/json")
      .send({ _id: commentId })
      .expect(200)
      .end(async (err, res) => {
        if (err) {
          return done(err);
        }
        expect(mockDeleteOne).toHaveBeenCalled();
        expect(res.body).toHaveProperty(
          "status",
          "Comment deleted successfully."
        );
        done();
      });
  });
  it("Comment ownership validation should not apply if user is admin.", (done) => {
    (0, testapp_1.toggleAuthTestVariable)(true, "admin");
    mockFindById.mockImplementationOnce(() => {
      return Promise.resolve({ user: "100" });
    });
    (0, supertest_1.default)(testapp_1.default)
      .delete("/comment")
      .set("Accept", "application/json")
      .send({ _id: commentId })
      .expect(200)
      .end(async (err, res) => {
        if (err) {
          return done(err);
        }
        expect(mockFindById).not.toHaveBeenCalled();
        expect(mockDeleteOne).toHaveBeenCalled();
        await done();
        mockFindById();
      });
  });
});
describe("Comment update should work if user authenticated and _id is validated", () => {
  const commentId = new mongoose_1.default.Types.ObjectId();
  const postId = new mongoose_1.default.Types.ObjectId();
  const userId = new mongoose_1.default.Types.ObjectId();
  beforeEach(() => {
    mockUpdateOne.mockClear();
    mockFindById.mockClear();
  });
  it("Comment should not be updated if user is not authenticated", (done) => {
    (0, testapp_1.toggleAuthTestVariable)(false);
    (0, supertest_1.default)(testapp_1.default)
      .put("/comment")
      .set("Accept", "application/json")
      .send({
        content: "test content",
        _id: commentId,
        post: postId,
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
  it("Comment should not be updated if user member status is only regular (privileged or admin, a must)", (done) => {
    (0, testapp_1.toggleAuthTestVariable)(true, "regular");
    (0, supertest_1.default)(testapp_1.default)
      .put("/comment")
      .set("Accept", "application/json")
      .send({
        content: "test content",
        _id: commentId,
        post: postId,
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
  it("Comment should not be updated if _id is not in database", (done) => {
    (0, testapp_1.toggleAuthTestVariable)(true);
    databaseMockGenerator(mockCommentExists)(
      new mongoose_1.default.Types.ObjectId()
    );
    (0, supertest_1.default)(testapp_1.default)
      .put("/comment")
      .set("Accept", "application/json")
      .send({
        content: "test content",
        _id: commentId,
        post: postId,
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
  it("Comment should not be updated if user is not the owner of the comment.", (done) => {
    (0, testapp_1.toggleAuthTestVariable)(true);
    mockFindById.mockImplementationOnce(() => {
      return Promise.resolve({ user: "100" });
    });
    (0, supertest_1.default)(testapp_1.default)
      .put("/comment")
      .set("Accept", "application/json")
      .send({
        content: "tested content",
        _id: commentId,
        post: postId,
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
  it("Expect comment update to redirect to origin if origin header is supplied", (done) => {
    const origin = "http://127.0.0.1:3000";
    (0, testapp_1.toggleAuthTestVariable)(true);
    databaseMockGenerator(mockCommentExists)(commentId);
    (0, supertest_1.default)(testapp_1.default)
      .put("/comment")
      .set("Origin", origin)
      .set("Accept", "application/json")
      .send({
        content: "test content",
        _id: commentId,
        post: postId,
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
  it("Expect comment update to return an object with comment updated status if origin header is not present", (done) => {
    (0, testapp_1.toggleAuthTestVariable)(true);
    databaseMockGenerator(mockCommentExists)(commentId);
    (0, supertest_1.default)(testapp_1.default)
      .put("/comment")
      .set("Accept", "application/json")
      .send({
        content: "test content",
        _id: commentId,
        post: postId,
        user: userId,
      })
      .expect(200)
      .end(async (err, res) => {
        if (err) {
          return done(err);
        }
        expect(mockUpdateOne).toHaveBeenCalled();
        expect(res.body).toHaveProperty(
          "status",
          "Comment updated successfully."
        );
        done();
      });
  });
  it("Comment ownership validation should not apply if user is admin.", (done) => {
    (0, testapp_1.toggleAuthTestVariable)(true, "admin");
    mockFindById.mockImplementationOnce(() => {
      return Promise.resolve({ user: "100" });
    });
    (0, supertest_1.default)(testapp_1.default)
      .put("/comment")
      .set("Accept", "application/json")
      .send({
        content: "test content",
        _id: commentId,
        post: postId,
        user: userId,
      })
      .expect(200)
      .end(async (err, res) => {
        if (err) {
          return done(err);
        }
        expect(mockFindById).not.toHaveBeenCalled();
        expect(mockDeleteOne).toHaveBeenCalled();
        await done();
        mockFindById();
      });
  });
});
