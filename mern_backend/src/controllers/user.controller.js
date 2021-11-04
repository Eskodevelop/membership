import User from "../models/user.model";
import _ from "lodash";
import errorHandler from "../controllers/helpers/dbErrorHandler";
import crypto from "crypto";

const create = (req, res, next) => {
  const user = new User(req.body);
  console.log(user);
  user.save((err, result) => {
    if (err) {
      return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
    }
    res.status(200).json({
      message: "Succesfully created a new user.",
    });
  });
};

const list = (req, res) => {
  User.find((err, users) => {
    if (err) {
      return res.status(400).json({ error: errorHandler.getErrorMessage() });
    }
    res.status(200).json(users);
  }).select("name email update created");
};

const userByID = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: "User not found" });
    }
    req.profile = user;
    next();
  });
};

const read = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  res.status(200).json(req.profile);
};

const encryptPassword = (password, salt) => {
  try {
    return crypto.createHmac("sha1", salt).update(password).digest("hex");
  } catch (err) {
    return "";
  }
};

const update = (req, res, next) => {
  let user = req.profile;
  let data = req.body;

  if (data.password !== "") {
    data.hashed_password = encryptPassword(data.password, user.salt);
    delete data.password;
  }

  user = _.extend(user, data);
  user.updated = Date.now();

  user.save((err) => {
    if (err) {
      return res.status(400).json({ error: errorHandler.getErrorMessage() });
    }
    res.status(200).json(user);
  });
};

const remove = (req, res, next) => {
  let user = req.profile;
  user.remove((err, deletedUser) => {
    if (err) {
      return res.status(400).json({ error: errorHandler.getErrorMessage() });
    }
    deletedUser.hashed_password = undefined;
    deletedUser.salt = undefined;
    res.status(200).json(deletedUser);
  });
};

export default { create, list, userByID, read, update, remove };
