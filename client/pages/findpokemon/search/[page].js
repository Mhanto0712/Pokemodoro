import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { todayTrainingConvert, idConvert } from "../../../others/time.js";
import axios from "axios";
import style from "../../../styles/findsearch.module.scss";
const API_URL = "https://pokemodoro-server.zeabur.app/poke/findpokemon/search/";
const SEARCH_URL = "https://pokemodoro-client.zeabur.app/findpokemon/search/";
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
      //未收服
      setLength(data.length);
    }
    if (error) {
      alert(error);
      router.push("/");
    }
  }, [getReqUser]);
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
          <h4 className={style.uncatch} data-stroke={`未收服： ${length} `}>
            未收服： {length}
          </h4>
        </section>
        <section className={style.right}>
          <div className={style.Area}>
            <div className={style.row}>
              {data && (
                <div
                  className={style.data}
                  onClick={(e) => {
                    router.push(TRAINING_URL + data.obj.id);
                  }}
                >
                  <img src={data.obj.thumb} className={style.thumb}></img>
                  <p className={style.idAndName}>
                    {idConvert(data.obj.id)} &nbsp;&nbsp;
                    {data.obj.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
