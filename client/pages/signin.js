import { useState, useEffect } from "react";
import Layout from "../components/layout.js";
import Link from "next/link.js";
import { useRouter } from "next/router";
import AuthService from "../service/auth.js";
import axios from "axios";
import style from "../styles/signin.module.scss";

export default function SignIn({ currentUser, setCurrentUser }) {
  const router = useRouter();
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");
  let [message, setMessage] = useState("");
  const API_URL = "https://pokemodoro-server.zeabur.app/api/user";
  //確認是否已經是登入狀態
  useEffect(() => {
    if (currentUser) {
      alert("您已登入，將回到首頁");
      router.push("/");
    }
  }, [currentUser]);
  //根據輸入的值改變需要送出的值
  const onChangeEmail = (e) => {
    setEmail(e.target.value);
  };
  const onChangePassword = (e) => {
    setPassword(e.target.value);
  };
  //開始訓練Pokemon吧－按鈕
  const onClickButton = async () => {
    try {
      await AuthService.localSignIn(email, password);
      window.alert("登入成功，將回到首頁");
      AuthService.getCurrentUser().then((data) => {
        setCurrentUser(data);
      });
      router.push("/");
    } catch (e) {
      setMessage(e.response.data);
    }
  };
  return (
    <div>
      <section className={style.section}>
        <div className={style.whole}>
          <div className={style.google}>
            <h2
              style={{
                fontSize: "1rem",
                paddingTop: "0.6rem",
                color: "rgb(77, 31, 0,0.5)",
              }}
            >
              Google登入：
            </h2>
            <Link href={API_URL + "/google"}>
              <img
                src="google.png"
                alt="google登入"
                style={{ width: "12rem" }}
              />
            </Link>
          </div>
          {message && <div className="alert alert-danger">{message}</div>}
          <div className={style.row}>
            <label
              htmlFor="exampleFormControlInput1"
              className={`form-label ${style.label}`}
            >
              電子郵件
            </label>
            <input
              type="email"
              className={`form-control ${style.input}`}
              id="exampleFormControlInput1"
              placeholder="name@example.com"
              onChange={onChangeEmail}
            />
          </div>
          <div className={style.row}>
            <label
              htmlFor="inputPassword5"
              className={`form-label ${style.label}`}
            >
              密碼
            </label>
            <input
              type="password"
              id="inputPassword5"
              className={`form-control ${style.input}`}
              aria-labelledby="passwordHelpBlock"
              placeholder="8～20字之間"
              onChange={onChangePassword}
            />
            <div
              id="passwordHelpBlock"
              className="form-text"
              style={{ color: "rgb(77, 31, 0,0.5)" }}
            >
              ＊密碼需包含至少一大寫英文字、一小寫英文字、一數字以及一特殊符號，且不得包含英文外的其他語言＊
            </div>
          </div>
          <button
            className={`btn ${style.forgetPassword}`}
            type="submit"
            onClick={() => {
              router.push("/editpassword");
            }}
          >
            忘記密碼
          </button>
          <button
            className={`btn ${style.button}`}
            type="submit"
            onClick={onClickButton}
          >
            開始訓練Pokemon吧！
          </button>
        </div>
      </section>
    </div>
  );
}
