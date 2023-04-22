import { useState, useEffect } from "react";
import Layout from "../components/layout.js";
import Link from "next/link.js";
import { useRouter } from "next/router";
import AuthService from "../service/auth.js";
import style from "../styles/signup.module.scss";

export default function SignUp({ currentUser, setCurrentUser }) {
  const router = useRouter();
  let [username, setUsername] = useState("");
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");
  let [code, setCode] = useState("");
  let [message, setMessage] = useState(null);
  const API_URL = "http://localhost:8080/api/user";
  //根據輸入的值改變需要送出的值
  const onChangeEmail = (e) => {
    setEmail(e.target.value);
  };
  const onChangePassword = (e) => {
    setPassword(e.target.value);
  };
  const onChangeCode = (e) => {
    setCode(e.target.value);
  };
  //發送email驗證碼－按鈕
  const onClickCAPTCHA = () => {
    AuthService.sendCAPTCHA(email)
      .then(() => {
        window.alert("驗證碼已發送，請確認後輸入。");
      })
      .catch((e) => {
        setMessage(e.response.data);
      });
  };
  //成為Pokemon訓練家！－按鈕
  const onClickButton = () => {
    AuthService.editPassword(email, password, code)
      .then(() => {
        window.alert("變更成功，將進入登入頁面");
        router.push("/signin");
      })
      .catch((e) => {
        setMessage(e.response.data);
      });
  };
  return (
    <div>
      <section className={style.section}>
        <div className={style.whole}>
          {message && <div className="alert alert-danger">{message}</div>}
          <div className={style.row}>
            <label
              htmlFor="exampleFormControlInput1"
              className={`form-label ${style.label}`}
            >
              電子郵件
            </label>
            <button className={style.sendCAPTCHA} onClick={onClickCAPTCHA}>
              發送email驗證碼
            </button>
            <input
              type="email"
              className={`form-control ${style.input}`}
              id="exampleFormControlInput2"
              placeholder="name@example.com"
              onChange={onChangeEmail}
            />
          </div>
          <div className={style.row}>
            <label
              htmlFor="inputPassword5"
              className={`form-label ${style.label}`}
            >
              新密碼
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
          <div className={style.row}>
            <input
              type="text"
              id="exampleFormControlInput3"
              className={`form-control ${style.input} ${style.inputCAPTCHA}`}
              aria-labelledby="passwordHelpBlock"
              placeholder="請輸入email驗證碼"
              onChange={onChangeCode}
            />
          </div>
          <button
            className={`btn ${style.button}`}
            type="submit"
            onClick={onClickButton}
          >
            確認！
          </button>
        </div>
      </section>
    </div>
  );
}
