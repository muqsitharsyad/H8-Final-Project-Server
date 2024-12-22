const { ObjectId } = require("mongodb");
const { database } = require("../configs/mongodb");
const { hashPassword } = require("../helpers/bcrypt");
const validateEmail = require("../helpers/emailValidation");
class UserModel {
  static collection() {
    return database.collection("users");
  }

  static async findByEmail(email) {
    return this.collection().findOne({ email });
  }

  static async findById(id) {
    const user = await this.collection()
      .aggregate([
        {
          $match: {
            _id: new ObjectId(String(id)),
          },
        },
      ])
      .toArray();

    if (!user[0]) throw new Error("User not found");
    return user[0];
  }

  static async findByUsername(username) {
    const users = await this.collection()
      .find({
        username: { $regex: username, $options: "i" },
      })
      .toArray();

    return users;
  }

  static async findAll() {
    const users = await this.collection().find().toArray();
    return users;
  }

  static async register(newUser) {
    const validation = validateEmail(newUser.email);
    if (!validation) throw new Error("Invalid Email Format!");

    if (newUser.password.length <= 6)
      throw new Error("Password must be at least 6 characters");

    const existUser = await this.findByEmail(newUser.email);
    if (existUser) throw new Error("Email already exist");

    newUser.password = hashPassword(newUser.password);
    newUser.createdAt = new Date();
    newUser.updatedAt = new Date();

    const result = await this.collection().insertOne(newUser);
    return result;
  }
}

module.exports = UserModel;
