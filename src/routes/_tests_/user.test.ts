import bcrypt from "bcryptjs";
import mongoose, { connection } from "mongoose";
import request from "supertest";
import { Response } from "supertest";
import app from "../../testapp";
import { Comment } from "../../models/comment";
import { Post } from "../../models/post";
import { User } from "../../models/user";

jest.mock("mongoose", () => {
  const actualModule = jest.requireActual("mongoose");
  return {
    __esModule: true,
    default: {
      ...actualModule,
      connection: {
        transaction: (updateOne: () => Promise<void> | Error) => {
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
  const mockHash = jest.fn().mockImplementation((password: string) => {
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
  const checkIfErrorsPresent = function (res: Response) {
    if (!("errors" in res.body)) {
      throw new Error("Errors object not present");
    }
  };

  const mockIdParam = new mongoose.Types.ObjectId().toString();

  return {
    checkIfErrorsPresent,
    mockIdParam,
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
const { checkIfErrorsPresent, mockIdParam } = addOns();

bcrypt.compare = mockCompare;
bcrypt.hash = mockHash;
Comment.deleteMany = mockDeleteMany;
Post.deleteMany = mockDeleteMany;
Post.find = mockFind;
User.deleteOne = mockDeleteOne;
User.exists = mockUserExists;
User.findById = mockFindById;
User.findOne = mockFindOne;
User.updateOne = mockUpdateOne;

describe("Delete user should return success confirmation ", () => {
  beforeEach(() => {
    mockDeleteOne.mockClear();
  });


  it("User delete with correct credentials should return confirmation status", (done) => {
    request(app)
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
    mockUserExists.mockImplementationOnce((idQuery: Record<"_id", string>) => {
      const result = idQuery._id === mockIdParam;
      return Promise.resolve(result);
    });

    request(app)
      .put(`/user/${new mongoose.Types.ObjectId().toString()}`)
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
    mockFindOne.mockImplementationOnce(
      (queryObject: Record<string, string>) => {
        return queryObject && queryObject.username === "already in";
      }
    );

    request(app)
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

    request(app)
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

describe("User update with correct credentials should return confirmation", () => {
  beforeEach(() => {
    mockUpdateOne.mockClear();
  });

  it("Update for updating to regular user", (done) => {
    request(app)
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

  it("Update for updating to privileged user", (done) => {
    request(app)
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

  it("Update for updating to admin user", (done) => {
    request(app)
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
