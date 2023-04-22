import express from "express";
const router = express.Router();
import User from "../models/user-model.js";
import passport from "passport";
import "dotenv/config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  localSignUpValid,
  localSignInValid,
  sendCAPTCHAValid,
  editUsernameValid,
  editpasswordValid,
} from "../validation.js";
import nodeMail from "../nodemailer.js";

//用戶端網址
const CLIENT_URL = "https://pokemodoro-client.zeabur.app/";

//mail驗證
let CAPTCHA = {};
router.post("/sendCAPTCHA", async (req, res) => {
  //確認是否符合validation
  let { error } = sendCAPTCHAValid(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //準備發送驗證碼
  const { email } = req.body;
  const code = String(Math.floor(Math.random() * 1000000)).padEnd(6, "0");
  CAPTCHA.code = code;
  //发送邮件
  const mail = {
    from: `"Pokemodoro製作者"<mhanto0712@gmail.com>`,
    subject: "Pokemodoro註冊驗證碼",
    to: email,
    html: `
          <p>您好！</p>
          <p>您的驗證碼為：<strong style="color:orangered;">${code}</strong></p>
          <p>如果不是您本人操作，請無視此郵件，謝謝。</p>
      `,
  };
  await nodeMail.sendMail(mail, (err, info) => {
    if (!err) {
      return res.send({ msg: "驗證碼發送成功！" });
    } else {
      return res.status(500).send({ msg: "驗證碼發送失敗，請稍後重試。" });
    }
  });
});
//Local signUp
router.post("/localsignup", async (req, res) => {
  req.body.signUpType = "local";
  //確認是否符合validation
  let { error } = localSignUpValid(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //確認在signUpTpye為"local"的情況下，email是否已被註冊
  let { signUpType, username, email, password, code } = req.body;
  let foundUser = await User.findOne({ signUpType, email }).exec();
  if (foundUser)
    return res
      .status(400)
      .send("在本地註冊中，該信箱已被使用，請使用別的信箱。");
  //若驗證碼輸入正確，則將新用戶儲存至資料庫
  if (code == CAPTCHA.code) {
    let newUser = new User({
      signUpType,
      username,
      email,
      password,
    });
    try {
      let savedUser = await newUser.save();
      return res.send({
        msg: "成功儲存！",
        使用者資料為: savedUser,
      });
    } catch (e) {
      return res.status(500).send("發生錯誤，無法儲存使用者......");
    }
  } else {
    return res.status(400).send("驗證碼輸入錯誤！");
  }
});
//Local signIn
router.post("/localsignin", async (req, res) => {
  //確認是否符合validation
  let { error } = localSignInValid(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //確認是否有此用戶
  let { email, password } = req.body;
  let foundUser = await User.findOne({ signUpType: "local", email });
  if (!foundUser)
    return res.status(400).send("使用者不存在，請確認信箱是否正確。");
  //確認密碼是否正確
  let { _id } = foundUser;
  foundUser.comparePassword(password, (err, isMatch) => {
    if (err) return res.status(500).send("伺服器發生錯誤。");
    if (isMatch) {
      let tokenObj = { _id, email };
      let token = jwt.sign(tokenObj, process.env.PASSPORT_JWT_SECRET);
      res.cookie("PokemodoroUser", "JWT " + token, {
        signed: true,
        maxAge: 2592000000,
        sameSite: "none",
        secure: true,
        domain: ".zeabur.app",
      });
      return res.send({
        msg: "成功使用本地登入。",
        token: "JWT " + token,
      });
    } else {
      return res.status(400).send("密碼錯誤，請再輸入一次。");
    }
  });
});
//變更密碼
router.patch("/editPassword", async (req, res) => {
  req.body.signUpType = "local";
  //確認是否符合validation
  let { error } = editpasswordValid(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //確認在signUpTpye為"local"的情況下，有沒有此用戶存在
  let { signUpType, email, password, code } = req.body;
  let foundUser = await User.findOne({ signUpType, email }).exec();
  if (!foundUser)
    return res.status(400).send("找不到此用戶，請確認輸入的email。");
  //若驗證碼輸入正確，則將資料庫的密碼
  if (code == CAPTCHA.code) {
    foundUser.password = password;
    try {
      let updatedUser = await foundUser.save();
      return res.send({
        msg: "成功更新！",
        User為: updatedUser,
      });
    } catch (e) {
      return res.status(500).send(e);
    }
  } else {
    return res.status(400).send("驗證碼輸入錯誤！");
  }
});

//Google signUp/login and redirect
router.get(
  "/google",
  passport.authenticate(
    "google",
    { session: false },
    {
      scope: ["profile", "email"],
      prompt: "select_account",
    }
  )
);
router.get(
  "/google/redirect",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    let { _id, googleID } = req.user;
    let tokenObj = { _id, googleID };
    let token = jwt.sign(tokenObj, process.env.PASSPORT_JWT_SECRET);
    res.cookie("PokemodoroUser", "JWT " + token, {
      signed: true,
      maxAge: 2592000000,
      sameSite: "none",
      secure: true,
      domain: ".zeabur.app",
    });
    return res.redirect(CLIENT_URL);
  }
);

//取得cookie資料
router.get("/findCookie", (req, res) => {
  let { PokemodoroUser } = req.signedCookies;
  return res.send(PokemodoroUser);
});
//刪除cookie資料
router.get("/deleteCookie", (req, res) => {
  res.clearCookie("PokemodoroUser", {
    domain: ".zeabur.app",
    sameSite: "none",
    secure: true,
  });
  res.end();
});

//已登入首頁：取得username資料
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let { _id, signUpType, username, email, date } = req.user;
    return res.send({
      _id,
      signUpType,
      username,
      email,
      date,
    });
  }
);
//已登入，更改username
router.patch(
  "/editUsername",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    //確認是否符合validation
    let { error } = editUsernameValid(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    //尋找user並更改username
    let { username } = req.body;
    try {
      let updatedUser = await User.findOneAndUpdate(
        { _id: req.user._id },
        { username },
        {
          new: true,
          runValidators: true,
        }
      ).exec();
      return res.send({
        msg: "成功更新！",
        Username為: updatedUser,
      });
    } catch (e) {
      return res.status(500).send(e);
    }
  }
);

export default router;
