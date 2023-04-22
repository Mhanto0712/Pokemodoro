//Basic import
import express from "express";
const app = express();
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import "dotenv/config";
import cors from "cors";
//Passport import
import passport from "passport";
import { googlePassport, jwtPassport } from "./config/passport.js";
googlePassport(passport);
jwtPassport(passport);
//Routes import
import authRoute from "./routes/auth-route.js";
import pokeRoute from "./routes/poke-route.js";
//schedule
import schedule from "node-schedule";
import Pokemon from "./models/poke-model.js";
const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_ATLAS_CONNECTION)
  .then(() => {
    console.log("已連接至mongoDB中的pokemodoroDB");
  })
  .catch((e) => {
    console.log("連接失敗");
    console.log(e);
  });

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  cors({
    credentials: true,
    origin: "https://pokemodoro-client.zeabur.app",
  })
);

//routes
app.use("/api/user", authRoute);
app.use("/poke", passport.authenticate("jwt", { session: false }), pokeRoute);

//Port
app.listen(port, () => {
  console.log("正在聆聽port......");
});

//每天00:00:00更新todayTraining
const job = schedule.scheduleJob("0 0 0 * * *", function () {
  Pokemon.updateMany({}, { todayTraining: 0 }).then(() => {
    console.log(new Date());
  });
});
