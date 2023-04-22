import mongoose from "mongoose";
const { Schema } = mongoose;
import bcrypt from "bcrypt";

const userSchema = new Schema({
  signUpType: {
    type: String,
    enum: ["local", "google"],
  },
  username: {
    type: String,
    minlength: 1,
    maxlength: 6,
  },
  googleID: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
    minlength: 8,
    maxlength: 20,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

//Local middlewares
userSchema.pre("save", async function (next) {
  if (this.password) {
    if (this.isNew || this.isModified("password")) {
      let hashValue = await bcrypt.hash(this.password, 12);
      this.password = hashValue;
    }
  }
  next();
});

//Local instance methods
userSchema.methods.comparePassword = async function (password, cb) {
  try {
    let result = await bcrypt.compare(password, this.password);
    return cb(null, result);
  } catch (e) {
    return cb(e, result);
  }
};

export default mongoose.model("User", userSchema);
