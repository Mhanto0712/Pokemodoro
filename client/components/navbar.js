import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import AuthService from "../service/auth.js";
import Link from "next/link";
import cookie from "cookie";

export default function Navbar({
  currentUser,
  setCurrentUser,
  getReqUser,
  setGetReqUser,
  isLoading,
  setIsLoading,
}) {
  const router = useRouter();
  const currentRoute = router.asPath;
  const onClickSignOut = () => {
    if (window) {
      document.cookie =
        "LastTrainingPokemon=" + 0 + "; path=/; max-age=0; SameSite=lax";
    }
    AuthService.signOut();
    window.alert("登出成功，將返回首頁。");
    setCurrentUser(null);
  };
  const lastTrainingPokemon = useRef(null);
  useEffect(() => {
    lastTrainingPokemon.current = cookie.parse(
      document.cookie
    ).LastTrainingPokemon;
    if (!lastTrainingPokemon.current) {
      lastTrainingPokemon.current = 1;
    } else {
      lastTrainingPokemon.current = Number(lastTrainingPokemon.current);
    }
  });
  const handleFetch = () => {
    setIsLoading(true);
  };
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <Link className="navbar-brand  nav-title" href="/">
          Pokemodoro
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link
                className={`nav-link ${currentRoute === "/" ? "active" : ""}`}
                aria-current="page"
                href="/"
              >
                首頁
              </Link>
            </li>
            {!currentUser && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    currentRoute === "/signup" ? "active" : ""
                  }`}
                  href="/signup"
                  onClick={handleFetch}
                  disabled={isLoading}
                >
                  註冊會員
                </Link>
              </li>
            )}
            {!currentUser && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    currentRoute === "/signin" ? "active" : ""
                  }`}
                  href="/signin"
                >
                  會員登入
                </Link>
              </li>
            )}
            {currentUser && getReqUser && (
              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {getReqUser.data.username || "Username"}
                </Link>
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      className="dropdown-item"
                      href={`/training/${lastTrainingPokemon.current}`}
                      onClick={handleFetch}
                      disabled={isLoading}
                    >
                      收服＆訓練時刻
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      href="/mypokemon/page/0"
                      onClick={handleFetch}
                      disabled={isLoading}
                    >
                      我的Pokemon
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      href="/findpokemon/page/0"
                      onClick={handleFetch}
                      disabled={isLoading}
                    >
                      尋找Pokemon
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" href="/editusername">
                      更改訓練家暱稱
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" href="/editpassword">
                      更改密碼
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      href="/"
                      onClick={onClickSignOut}
                    >
                      登出
                    </Link>
                  </li>
                </ul>
              </li>
            )}
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  currentRoute === "/about" ? "active" : ""
                }`}
                href="/about"
              >
                關於Pokemodoro
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
