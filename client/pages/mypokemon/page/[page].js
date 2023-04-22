import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { todayTrainingConvert, idConvert } from "../../../others/time.js";
import axios from "axios";
import style from "../../../styles/mypokemon.module.scss";
const API_URL = "https://pokemodoro-server.zeabur.app/poke/mypokemon/page/";
const SEARCH_URL = "https://pokemodoro-client.zeabur.app/mypokemon/search/";
const TRAINING_URL = "https://pokemodoro-client.zeabur.app/training/";

export async function getServerSideProps({ params, req }) {
  //解析cookie
  let cookie;
  let lastdot;
  let realToken;
  if (req.cookies["PokemodoroUser"]) {
    cookie = req.cookies["PokemodoroUser"];
    lastdot = cookie.lastIndexOf(".");
    realToken = cookie.substring(2, lastdot);
  }
  //取得資料
  try {
    //確認輸入的dynamic route是否為有效值
    let isNumber = Number(params.page);
    let isInt = Number.isInteger(isNumber);
    if ((isNumber != 0 && !isNumber) || isNumber < 0 || !isInt) {
      let error = "非有效網址。";
      return {
        props: {
          error,
        },
      };
    }
    let response = await axios.get(API_URL + params.page, {
      headers: {
        Authorization: realToken,
      },
    });
    let { data } = response;
    if ((isNumber + 1) * 6 - data.length >= 6) {
      let error = "非有效網址，或需至少有一隻1等以上的Pokemon。";
      return {
        props: {
          error,
        },
      };
    }
    return {
      props: {
        data,
      },
    };
  } catch (e) {
    let error;
    if (e.response) {
      error = e.response.data;
    } else if (e == "Unauthorized") {
      error = "請先登入。";
    } else {
      error = "其他伺服器問題";
    }
    return {
      props: {
        error,
      },
    };
  }
}

export default function MyPokemon({
  data,
  error,
  getReqUser,
  setGetReqUser,
  currentUser,
}) {
  const router = useRouter();
  //確認登入、進行收服與否
  const [todayTraining, setTodayTraining] = useState(null);
  const [length, setLength] = useState(null);
  const [highestLevel, setHighestLevel] = useState(null);
  useEffect(() => {
    if (data) {
      //登入後，是否有username
      if (currentUser) {
        if (!getReqUser.data.username) {
          alert("為自己取個訓練家暱稱吧！");
          router.push("/editusername");
        }
      }
      //今日訓練時間
      if (data.todayTraining) {
        setTodayTraining(todayTrainingConvert(data.todayTraining));
      } else {
        setTodayTraining(todayTrainingConvert(0));
      }
      //已收服
      setLength(data.length);
      //最高等級
      setHighestLevel(data.highestLevel);
    }
    if (error) {
      alert(error);
      router.push("/");
    }
  }, [getReqUser]);
  //製作上下一頁
  const currentRoute = router.asPath;
  const lastSlash = currentRoute.lastIndexOf("/");
  const afterSecondSlash = currentRoute.substring(
    lastSlash + 1,
    currentRoute.length
  );
  const nextRoute =
    currentRoute.substring(0, currentRoute.lastIndexOf("/") + 1) +
    (Number(afterSecondSlash) + 1);
  const previousRoute =
    currentRoute.substring(0, currentRoute.lastIndexOf("/") + 1) +
    (Number(afterSecondSlash) - 1);
  //製作搜尋功能
  const [search, setSearch] = useState(null);
  const onChangeSearch = (e) => {
    setSearch(e.target.value);
  };
  const searchRoute = SEARCH_URL + search;
  return (
    <div>
      <section className={style.section}>
        <section className={style.left}>
          <div className={style.search}>
            <input
              type="number"
              className={style.input}
              onChange={onChangeSearch}
            ></input>
            <div className={style.button}>
              <img
                src="/myandfindpokemon/magnifier.png"
                className={style.magnifier}
                onClick={() => {
                  if (search) {
                    router.push(searchRoute);
                  }
                }}
              ></img>
            </div>
          </div>
          <h4
            className={style.todayTraining}
            data-stroke={`今日訓練時間 ${todayTraining}`}
          >
            今日訓練時間 {todayTraining}
          </h4>
          <h4 className={style.catch} data-stroke={`已收服： ${length} `}>
            已收服： {length}
          </h4>
          <h4
            className={style.highestLevel}
            data-stroke={`最高等級： ${highestLevel}`}
          >
            最高等級： {highestLevel}
          </h4>
        </section>
        <section className={style.right}>
          <div className={style.Area}>
            <div className={style.row}>
              {data && data.result[0] && (
                <div
                  className={style.data}
                  onClick={(e) => {
                    router.push(TRAINING_URL + data.result[0].id);
                  }}
                >
                  <img src={data.result[0].thumb} className={style.thumb}></img>
                  <p className={style.idAndName}>
                    {idConvert(data.result[0].id)} &nbsp;&nbsp;
                    {data.result[0].name}
                    <span className={style.level}>
                      Lv.
                      {data.result[0].level}
                    </span>
                  </p>
                </div>
              )}
            </div>
            <div className={style.row}>
              {data && data.result[1] && (
                <div
                  className={style.data}
                  onClick={(e) => {
                    router.push(TRAINING_URL + data.result[1].id);
                  }}
                >
                  <img src={data.result[1].thumb} className={style.thumb}></img>
                  <p className={style.idAndName}>
                    {idConvert(data.result[1].id)} &nbsp;&nbsp;
                    {data.result[1].name}
                    <span className={style.level}>
                      Lv.
                      {data.result[1].level}
                    </span>
                  </p>
                </div>
              )}
            </div>
            <div className={style.row}>
              {data && data.result[2] && (
                <div
                  className={style.data}
                  onClick={(e) => {
                    router.push(TRAINING_URL + data.result[2].id);
                  }}
                >
                  <img src={data.result[2].thumb} className={style.thumb}></img>
                  <p className={style.idAndName}>
                    {idConvert(data.result[2].id)} &nbsp;&nbsp;
                    {data.result[2].name}
                    <span className={style.level}>
                      Lv.
                      {data.result[2].level}
                    </span>
                  </p>
                </div>
              )}
            </div>
            <div className={style.row}>
              {data && data.result[3] && (
                <div
                  className={style.data}
                  onClick={(e) => {
                    router.push(TRAINING_URL + data.result[3].id);
                  }}
                >
                  <img src={data.result[3].thumb} className={style.thumb}></img>
                  <p className={style.idAndName}>
                    {idConvert(data.result[3].id)} &nbsp;&nbsp;
                    {data.result[3].name}
                    <span className={style.level}>
                      Lv.
                      {data.result[3].level}
                    </span>
                  </p>
                </div>
              )}
            </div>
            <div className={style.row}>
              {data && data.result[4] && (
                <div
                  className={style.data}
                  onClick={(e) => {
                    router.push(TRAINING_URL + data.result[4].id);
                  }}
                >
                  <img src={data.result[4].thumb} className={style.thumb}></img>
                  <p className={style.idAndName}>
                    {idConvert(data.result[4].id)} &nbsp;&nbsp;
                    {data.result[4].name}
                    <span className={style.level}>
                      Lv.
                      {data.result[4].level}
                    </span>
                  </p>
                </div>
              )}
            </div>
            <div className={style.row}>
              {data && data.result[5] && (
                <div
                  className={style.data}
                  onClick={(e) => {
                    router.push(TRAINING_URL + data.result[5].id);
                  }}
                >
                  <img src={data.result[5].thumb} className={style.thumb}></img>
                  <p className={style.idAndName}>
                    {idConvert(data.result[5].id)} &nbsp;&nbsp;
                    {data.result[5].name}
                    <span className={style.level}>
                      Lv.
                      {data.result[5].level}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className={style.changePage}>
            {data && data.end > 6 && (
              <img
                src="/myandfindpokemon/back.png"
                className={style.goBack}
                onClick={() => {
                  router.push(previousRoute);
                }}
              ></img>
            )}
            {data && data.end < data.length && (
              <img
                src="/myandfindpokemon/next.png"
                className={style.nextPage}
                onClick={() => {
                  router.push(nextRoute);
                }}
              ></img>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}
