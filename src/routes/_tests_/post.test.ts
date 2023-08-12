import mongoose from "mongoose";
import request, { Response } from "supertest";
import { Comment } from "../../models/comment";
import { Post } from "../../models/post";
import { User } from "../../models/user";
import app, { toggleAuthTestVariable } from "../../testapp";

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
        transaction: (write: () => Promise<void> | Error) => {
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

const checkIfErrorsPresent = function (res: Response) {
  if (!("errors" in res.body)) {
    throw new Error("Errors object not present");
  }
};

const {
  mockCreate,
  mockDeleteOne,
  mockDeleteMany,
  mockFindById,
  mockPostExists,
  mockUpdateOne,
  mockUserExists,
} = generateMocks();

Comment.deleteMany = mockDeleteMany;
Post.create = mockCreate;
Post.deleteOne = mockDeleteOne;
Post.exists = mockPostExists;
Post.findById = mockFindById;
Post.updateOne = mockUpdateOne;
User.exists = mockUserExists;

describe("Post creation should work if user authenticated user id is validated", () => {
  const userId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    mockCreate.mockClear();
  });

  it("Post should not be created if user is not authenticated", (done) => {
    toggleAuthTestVariable(false, "admin");

    request(app)
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
    toggleAuthTestVariable(true, "regular");

    request(app)
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
    toggleAuthTestVariable(true, "privileged");

    request(app)
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
    toggleAuthTestVariable(true, "admin");

    request(app)
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
    toggleAuthTestVariable(true, "admin");

    request(app)
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
    toggleAuthTestVariable(true, "admin");

    request(app)
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
    toggleAuthTestVariable(true, "admin");

    request(app)
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
    toggleAuthTestVariable(true, "admin");
    mockUserExists.mockImplementationOnce(() => {
      Promise.resolve(false);
    });

    request(app)
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

  it("Expect post creation to return an object with post created status", (done) => {
    toggleAuthTestVariable(true, "admin");

    request(app)
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
  const postId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    mockDeleteOne.mockClear();
    mockFindById.mockClear();
  });

  it("Post should not be deleted if user is not authenticated", (done) => {
    toggleAuthTestVariable(false, "admin");

    request(app)
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
    toggleAuthTestVariable(true, "regular");

    request(app)
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
    toggleAuthTestVariable(true, "privileged");

    request(app)
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
    toggleAuthTestVariable(true, "admin");
    mockFindById.mockImplementationOnce(() => {
      return Promise.resolve({ user: "100" });
    });

    request(app)
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


  it("Expect Post deletion to return an object with Post deleted status", (done) => {
    toggleAuthTestVariable(true, "admin");

    request(app)
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
  const postId = new mongoose.Types.ObjectId();
  const userId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    mockUpdateOne.mockClear();
    mockFindById.mockClear();
  });

  it("Post should not be updated if user is not authenticated", (done) => {
    toggleAuthTestVariable(false);

    request(app)
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
    toggleAuthTestVariable(true, "regular");

    request(app)
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
    toggleAuthTestVariable(true, "admin");
    mockUserExists.mockImplementationOnce(() => {
      Promise.resolve(false);
    });

    request(app)
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
    toggleAuthTestVariable(true, "admin");
    mockFindById.mockImplementationOnce(() => {
      return Promise.resolve({ user: "100" });
    });

    request(app)
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

  it("Expect Post update to return an object with Post updated status", (done) => {
    toggleAuthTestVariable(true, "admin");

    request(app)
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
