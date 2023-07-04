"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const supertest_1 = __importDefault(require("supertest"));
const testapp_1 = __importDefault(require("../../testapp"));
const comment_1 = require("../../models/comment");
const post_1 = require("../../models/post");
const user_1 = require("../../models/user");
jest.mock("mongoose", () => {
  const actualModule = jest.requireActual("mongoose");
  return {
    __esModule: true,
    default: {
      ...actualModule,
      connection: {
        transaction: (updateOne) => {
          return Promise.resolve(updateOne());
        },
      },
    },
  };
});
jest.mock("bcryptjs");
jest.mock("../../models/comment");
jest.mock("../../models/post");
jest.mock("../../models/user");
const generateMocks = function () {
  const mockCompare = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
  });
  const mockDeleteOne = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
  });
  const mockDeleteMany = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
  });
  const mockFind = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
  });
  const mockFindById = jest.fn().mockImplementation(() => {
    return Promise.resolve({ password: "this password" });
  });
  const mockFindOne = jest.fn();
  const mockHash = jest.fn().mockImplementation((password) => {
    return Promise.resolve(password);
  });
  const mockUpdateOne = jest.fn().mockImplementation(() => {
    return Promise.resolve();
  });
  const mockUserExists = jest
    .fn()
    .mockImplementation(() => Promise.resolve(true));
  return {
    mockCompare,
    mockDeleteOne,
    mockDeleteMany,
    mockFind,
    mockFindById,
    mockFindOne,
    mockHash,
    mockUpdateOne,
    mockUserExists,
  };
};
const addOns = function () {
  const checkIfErrorsPresent = function (res) {
    if (!("errors" in res.body)) {
      throw new Error("Errors object not present");
    }
  };
  const mockIdParam = new mongoose_1.default.Types.ObjectId().toString();
  const origin = "http://localhost:3000";
  return {
    checkIfErrorsPresent,
    mockIdParam,
    origin,
  };
};
const {
  mockCompare,
  mockDeleteOne,
  mockDeleteMany,
  mockFind,
  mockFindById,
  mockFindOne,
  mockHash,
  mockUpdateOne,
  mockUserExists,
} = generateMocks();
const { checkIfErrorsPresent, mockIdParam, origin } = addOns();
bcryptjs_1.default.compare = mockCompare;
bcryptjs_1.default.hash = mockHash;
comment_1.Comment.deleteMany = mockDeleteMany;
post_1.Post.deleteMany = mockDeleteMany;
post_1.Post.find = mockFind;
user_1.User.deleteOne = mockDeleteOne;
user_1.User.exists = mockUserExists;
user_1.User.findById = mockFindById;
user_1.User.findOne = mockFindOne;
user_1.User.updateOne = mockUpdateOne;
describe("Delete user should redirect to origin or return confirmation ", () => {
  beforeEach(() => {
    mockDeleteOne.mockClear();
  });
  it("User delete with correct credentials and with Origin header should redirect", (done) => {
    (0, supertest_1.default)(testapp_1.default)
      .delete(`/user/${mockIdParam}`)
      .set("Accept", "application/json")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("Origin", origin)
      .expect(302)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.header.location).toEqual(origin);
        expect(mockDeleteOne).toHaveBeenCalled();
        done();
      });
  });
  it("User delete with correct credentials with no Origin header should return confirmation status", (done) => {
    (0, supertest_1.default)(testapp_1.default)
      .delete(`/user/${mockIdParam}`)
      .set("Accept", "application/json")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(mockDeleteOne).toHaveBeenCalled();
        expect(res.body).toHaveProperty("status");
        done();
      });
  });
});
describe("Update user should have validation checks for _id, username, password", () => {
  beforeEach(() => {
    mockUpdateOne.mockClear();
  });
  it("User update should validate _id from params and check that it is an existing user", (done) => {
    mockUserExists.mockImplementationOnce((idQuery) => {
      const result = idQuery._id === mockIdParam;
      return Promise.resolve(result);
    });
    (0, supertest_1.default)(testapp_1.default)
      .put(`/user/${new mongoose_1.default.Types.ObjectId().toString()}`)
      .set("Accept", "application/json")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({ current_password: "old password", new_password: "new password" })
      .expect(checkIfErrorsPresent)
      .expect(400)
      .end(async (err, res) => {
        if (err) {
          return done(err);
        }
        expect(mockUpdateOne).not.toHaveBeenCalled();
        expect(res.body).toHaveProperty("errors.id.msg");
        done();
      });
  });
  it("User update should validate if duplicate usernames", (done) => {
    mockFindOne.mockImplementationOnce((queryObject) => {
      return queryObject && queryObject.username === "already in";
    });
    (0, supertest_1.default)(testapp_1.default)
      .put(`/user/${mockIdParam}`)
      .set("Accept", "application/json")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({ username: "already in" })
      .expect(checkIfErrorsPresent)
      .expect(400)
      .end(async (err, res) => {
        if (err) {
          return done(err);
        }
        expect(mockFindOne).lastReturnedWith(true);
        expect(mockUpdateOne).not.toHaveBeenCalled();
        expect(res.body).toHaveProperty("errors.username.msg");
        done();
      });
  });
  it("User update should validate current password and confirm it is the same as the one in database or else throw an error", (done) => {
    mockCompare.mockImplementationOnce(() => {
      return Promise.resolve(false);
    });
    (0, supertest_1.default)(testapp_1.default)
      .put(`/user/${mockIdParam}`)
      .set("Accept", "application/json")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({ current_password: "old password", new_password: "new password" })
      .expect(checkIfErrorsPresent)
      .expect(400)
      .end(async (err, res) => {
        if (err) {
          return done(err);
        }
        expect(mockUpdateOne).not.toHaveBeenCalled();
        expect(res.body).toHaveProperty("errors.msg");
        done();
      });
  });
});
describe("User update with correct credentials should either redirect to origin or return confirmation", () => {
  beforeEach(() => {
    mockUpdateOne.mockClear();
  });
  it("Update w/redirect for updating to regular user", (done) => {
    (0, supertest_1.default)(testapp_1.default)
      .put(`/user/${mockIdParam}`)
      .set("Accept", "application/json")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("Origin", origin)
      .send({
        first_name: "Jane",
        last_name: "Doe",
        username: "some username",
        current_password: "old password",
        new_password: "new password",
        regular: true,
      })
      .expect(302)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.header.location).toEqual(origin);
        expect(mockUpdateOne).toHaveBeenCalled();
        done();
      });
  });
  it("Update w/redirect for updating to privileged user", (done) => {
    (0, supertest_1.default)(testapp_1.default)
      .put(`/user/${mockIdParam}`)
      .set("Accept", "application/json")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("Origin", origin)
      .send({
        first_name: "Jane",
        last_name: "Doe",
        username: "some username",
        current_password: "old password",
        new_password: "new password",
        regular: true,
        privilege_code: "1234",
      })
      .expect(302)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.header.location).toEqual(origin);
        expect(mockUpdateOne).toHaveBeenCalled();
        done();
      });
  });
  it("Update w/redirect for updating to admin user", (done) => {
    (0, supertest_1.default)(testapp_1.default)
      .put(`/user/${mockIdParam}`)
      .set("Accept", "application/json")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("Origin", origin)
      .send({
        first_name: "Jane",
        last_name: "Doe",
        username: "some username",
        current_password: "old password",
        new_password: "new password",
        regular: true,
        privilege_code: "1234",
        admin_code: "4321",
      })
      .expect(302)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.header.location).toEqual(origin);
        expect(mockUpdateOne).toHaveBeenCalled();
        done();
      });
  });
  it("Update w/out redirect for updating to regular user", (done) => {
    (0, supertest_1.default)(testapp_1.default)
      .put(`/user/${mockIdParam}`)
      .set("Accept", "application/json")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({
        first_name: "Jane",
        last_name: "Doe",
        username: "some username",
        current_password: "old password",
        new_password: "new password",
        regular: true,
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body).toHaveProperty("status");
        expect(mockUpdateOne).toHaveBeenCalled();
        done();
      });
  });
  it("Update w/out redirect for updating to privileged user", (done) => {
    (0, supertest_1.default)(testapp_1.default)
      .put(`/user/${mockIdParam}`)
      .set("Accept", "application/json")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({
        first_name: "Jane",
        last_name: "Doe",
        username: "some username",
        current_password: "old password",
        new_password: "new password",
        regular: true,
        privilege_code: "1234",
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body).toHaveProperty("status");
        expect(mockUpdateOne).toHaveBeenCalled();
        done();
      });
  });
  it("Update w/out redirect for updating to admin user", (done) => {
    (0, supertest_1.default)(testapp_1.default)
      .put(`/user/${mockIdParam}`)
      .set("Accept", "application/json")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({
        first_name: "Jane",
        last_name: "Doe",
        username: "some username",
        current_password: "old password",
        new_password: "new password",
        regular: true,
        privilege_code: "1234",
        admin_code: "4321",
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body).toHaveProperty("status");
        expect(mockUpdateOne).toHaveBeenCalled();
        done();
      });
  });
});
