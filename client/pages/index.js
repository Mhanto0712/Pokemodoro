import { useEffect } from "react";
import { useRouter } from "next/router.js";
import Layout from "../components/layout.js";
import Link from "next/link.js";
import style from "../styles/home.module.scss";

export default function Home({
  currentUser,
  setCurrentUser,
  getReqUser,
  setGetReqUser,
}) {
  let router = useRouter();
  useEffect(() => {
    if (currentUser) {
      if (!getReqUser.data.username) {
        alert("為自己取個訓練家暱稱吧！");
        router.push("/editusername");
      }
    }
  }, [getReqUser]);
  return (
    <div>
      <section className={style.section}>
        <h1 className={style.title}>Pokemodoro</h1>
        <div className={style.button}>
          {!currentUser && (
            <Link className={style.link} href="/signup">
              註冊會員
            </Link>
          )}
          {currentUser && (
            <Link className={style.link} href="/mypokemon/page/0">
              我的Pokemon
            </Link>
          )}
          {!currentUser && (
            <Link className={style.link} href="/signin">
              會員登入
            </Link>
          )}
          {currentUser && (
            <Link className={style.link} href="/findpokemon/page/0">
              尋找Pokemon
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
