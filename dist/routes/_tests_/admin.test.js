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
const supertest_1 = __importDefault(require("supertest"));
const testapp_1 = __importStar(require("../../testapp"));
const post_1 = require("../../models/post");
jest.mock("../../models/post");
const generateMocks = function () {
  const mockFind = jest.fn().mockImplementation(() => {
    return {
      populate: (obj) => {
        return {
          exec: () => {
            return {};
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
const checkIfErrorsPresent = function (res) {
  if (!("errors" in res.body)) {
    throw new Error("Errors object not present");
  }
};
describe("admin route should return posts and user, if user is authenticated and user is admin", () => {
  it("If user is not authenticated, deny access", (done) => {
    (0, testapp_1.toggleAuthTestVariable)(false, "admin");
    (0, supertest_1.default)(testapp_1.default)
      .get("/admin")
      .set("Accept", "application/json")
      .expect(checkIfErrorsPresent)
      .expect(400)
      .end(async (err, res) => {
        if (err) {
          return await done(err);
        }
        expect(mockFind).not.toHaveBeenCalled();
        await done();
      });
  });
  it("If user is not admin, deny access", (done) => {
    (0, testapp_1.toggleAuthTestVariable)(true, "privileged");
    (0, supertest_1.default)(testapp_1.default)
      .get("/admin")
      .set("Accept", "application/json")
      .expect(checkIfErrorsPresent)
      .expect(400)
      .end(async (err, res) => {
        if (err) {
          return await done(err);
        }
        expect(mockFind).not.toHaveBeenCalled();
        await done();
      });
  });
  it("If user is credentialed, return posts and user", (done) => {
    (0, testapp_1.toggleAuthTestVariable)(true, "admin");
    (0, supertest_1.default)(testapp_1.default)
      .get("/admin")
      .set("Accept", "application/json")
      .expect(200)
      .end(async (err, res) => {
        if (err) {
          return await done(err);
        }
        expect(mockFind).toHaveBeenCalled();
        expect(res.body).toHaveProperty("user.username", "Jane Doe");
        expect(res.body).toHaveProperty("user.member_status", "admin");
        expect(res.body).toHaveProperty("user._id", "200");
        await done();
      });
  });
});
