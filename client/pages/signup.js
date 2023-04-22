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
  const API_URL = "https://pokemodoro-server.zeabur.app/api/user";
  //確認是否已經是登入狀態
  useEffect(() => {
    if (currentUser) {
      alert("您已登入，將回到首頁");
      router.push("/");
    }
  }, [currentUser]);
  //根據輸入的值改變需要送出的值
  const onChangeUsername = (e) => {
    setUsername(e.target.value);
  };
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
    AuthService.localSignUp(username, email, password, code)
      .then(() => {
        window.alert("註冊成功，將進入登入頁面");
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
          <div className={style.google}>
            <h2
              style={{
                fontSize: "1rem",
                paddingTop: "0.6rem",
                color: "rgb(77, 31, 0,0.5)",
              }}
            >
              Google登入：{" "}
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
              用戶名
            </label>
            <input
              type="text"
              className={`form-control ${style.input}`}
              id="exampleFormControlInput1"
              placeholder="只能包含中文、英文與數字"
              onChange={onChangeUsername}
            />
          </div>
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
            成為Pokemon訓練家！
          </button>
        </div>
      </section>
    </div>
  );
}
