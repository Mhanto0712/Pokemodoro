import { useState, useEffect } from "react";
import Link from "next/link.js";
import { useRouter } from "next/router";
import AuthService from "../service/auth.js";
import style from "../styles/signup.module.scss";

export default function SignUp({ currentUser, setCurrentUser }) {
  const router = useRouter();
  let [username, setUsername] = useState("");
  let [message, setMessage] = useState(null);
  //確認是否已經是登入狀態
  useEffect(() => {
    AuthService.getCurrentUser().then((data) => {
      if (!data) {
        alert("請先登入。");
        router.push("/signin");
      }
    });
  }, []);
  //根據輸入的值改變需要送出的值
  const onChangeUsername = (e) => {
    setUsername(e.target.value);
  };
  //成為Pokemon訓練家！－按鈕
  const onClickButton = () => {
    AuthService.editUsername(currentUser, username)
      .then(() => {
        window.alert("更改成功，將回到首頁");
        router.push("/");
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
          <button
            className={`btn ${style.button}`}
            type="submit"
            onClick={onClickButton}
          >
            確定訓練家暱稱！
          </button>
        </div>
      </section>
    </div>
  );
}
