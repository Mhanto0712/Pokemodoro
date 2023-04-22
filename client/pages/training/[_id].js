import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { createPortal } from "react-dom";
import axios from "axios";
import { todayTrainingConvert, idConvert } from "../../others/time.js";
import style from "../../styles/training.module.scss";
import AOS from "aos";
import "aos/dist/aos.css";
import Pokedex from "pokedex-promise-v2";
import PokeService from "../../service/poke.js";
import "setimmediate";
process.hrtime = require("browser-process-hrtime");
import NanoTimer from "nanotimer";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { easeLinear, easeQuadOut } from "d3-ease";
import AnimatedProgressProvider from "../../components/AnimatedProgressProvider.js";
const P = new Pokedex();
const API_URL = "https://pokemodoro-server.zeabur.app/poke/training/";
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
    let isNumber = Number(params._id);
    let isInt = Number.isInteger(isNumber);
    if (!isNumber || isNumber < 0 || isNumber > 905 || !isInt) {
      let error = "非有效網址。";
      return {
        props: {
          error,
        },
      };
    }
    let response = await axios.get(API_URL + params._id, {
      headers: {
        Authorization: realToken,
      },
    });
    let { data } = response;
    //groth rate表
    let levels = await P.getGrowthRateByName(data.growth);
    data.levels = levels;
    //進化鏈的id與sprites
    //baby
    let babyEvolution;
    try {
      babyEvolution = await P.getPokemonByName(data.evolution.baby.name);
    } catch (e) {
      let response = await axios.get(data.evolution.baby.url);
      babyEvolution = await P.getPokemonByName(response.data.id);
    }
    data.evolution.baby.id = babyEvolution.id;
    data.evolution.baby.sprites =
      babyEvolution.sprites.other["official-artwork"].front_default;
    //teen
    data.evolution.teen.id = [];
    data.evolution.teen.sprites = [];
    if (data.evolution.teen.name != []) {
      for (let i = 0; i < data.evolution.teen.name.length; i++) {
        let result;
        try {
          result = await P.getPokemonByName(data.evolution.teen.name[i]);
        } catch (e) {
          let response = await axios.get(data.evolution.teen.url[i]);
          result = await P.getPokemonByName(response.data.id);
        }
        data.evolution.teen.id.push(result.id);
        data.evolution.teen.sprites.push(
          result.sprites.other["official-artwork"].front_default
        );
      }
    }
    //adult
    data.evolution.adult.id = [];
    data.evolution.adult.sprites = [];
    if (data.evolution.adult.name != []) {
      for (let i = 0; i < data.evolution.adult.name.length; i++) {
        let result;
        try {
          result = await P.getPokemonByName(data.evolution.adult.name[i]);
        } catch (e) {
          let response = await axios.get(data.evolution.adult.url[i]);
          result = await P.getPokemonByName(response.data.id);
        }
        data.evolution.adult.id.push(result.id);
        data.evolution.adult.sprites.push(
          result.sprites.other["official-artwork"].front_default
        );
      }
    }
    return {
      props: {
        data,
        realToken,
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

export default function Training({
  data,
  error,
  realToken,
  currentUser,
  getReqUser,
  setGetReqUser,
}) {
  //確認是否已經是登入狀態
  const router = useRouter();
  //確認登入、進行收服與否
  const [captureTime, setCaptureTime] = useState(null);
  const [nextExp, setNextExp] = useState(null);
  const [arrayType, setArrayType] = useState(null);
  const [arrayWeak, setArrayWeak] = useState(null);
  const [evolTeen, setEvolTeen] = useState(null);
  const [evolAdult, setEvolAdult] = useState(null);
  const [checkState, setCheckState] = useState(null);
  const [changeTime, setChangeTime] = useState(null);
  const [changeLevel, setChangeLevel] = useState(null);
  const [consumption, setConsumption] = useState(0); //總消耗值
  const partConsump = useRef(0); //part consumption（會歸零的消耗值）
  //收服時間與下個等級
  const unCatchCaptureCalc = useRef(null);
  const catchingCaptureCalc = useRef(null);
  const oldLevel = useRef(null);
  const nextLevel = useRef(null);
  const nextCalc = useRef(null);
  //global
  useEffect(() => {
    //尚未進行收服
    if (data) {
      //登入後，是否有username
      if (currentUser) {
        if (!getReqUser.data.username) {
          alert("為自己取個訓練家暱稱吧！");
          router.push("/editusername");
        }
      }
      //計算capture rate（尚未認真過）和倒計時
      unCatchCaptureCalc.current = (291 - data.capture) * 100;
      setCaptureTime(unCatchCaptureCalc.current);
      setChangeTime(todayTrainingConvert(unCatchCaptureCalc.current));
      if (!data.founddata) {
        catchingCaptureCalc.current = (291 - data.capture) * 100;
        setCaptureTime(catchingCaptureCalc.current);
        setChangeTime(todayTrainingConvert(catchingCaptureCalc.current));
      }
      //將屬性換成array
      let typeObject = data.typeAndWeak.type;
      let typeArray = Object.keys(typeObject).map((key) => {
        return typeObject[key];
      });
      setArrayType(typeArray);
      //將優勢換成array
      let halfObject = data.typeAndWeak.half;
      let halfarray = Object.keys(halfObject).map((key) => {
        return halfObject[key];
      });
      let halfNameArray = [];
      let uniqueHalfArray = [];
      for (let i = 0; i < halfarray.length; i++) {
        let newHalfArray = halfarray[i];
        for (let i = 0; i < newHalfArray.length; i++) {
          halfNameArray.push(newHalfArray[i].name);
        }
        let halfArrToSet = new Set(halfNameArray);
        uniqueHalfArray = [...halfArrToSet];
      }
      //將弱點換成array
      let weakObject = data.typeAndWeak.weak;
      let weakarray = Object.keys(weakObject).map((key) => {
        return weakObject[key];
      });
      let weakNameArray = [];
      for (let i = 0; i < weakarray.length; i++) {
        let newWeakArray = weakarray[i];
        for (let i = 0; i < newWeakArray.length; i++) {
          if (uniqueHalfArray.indexOf(newWeakArray[i].name) == -1) {
            weakNameArray.push(newWeakArray[i].name);
          }
        }
        let weakArrToSet = new Set(weakNameArray);
        let uniqueWeakArray = [...weakArrToSet];
        setArrayWeak(uniqueWeakArray);
      }
      //evolTeen array index
      if (data.evolution.teen.name.length >= 1) {
        setEvolTeen(1);
      }
      //evolAdult array index
      if (data.evolution.teen.name.length >= 1) {
        setEvolAdult(1);
      }
      //確認Pokemon能否進行收服（需從baby狀態開始）
      const checkstat = () => {
        //是否為baby
        if (data.id == data.evolution.baby.id) {
          return "isBaby";
        }
        //是否為teen
        for (let teen of data.evolution.teen.id) {
          if (data.id == teen) {
            return "isTeen";
          }
        }
        //是否為adult
        for (let adult of data.evolution.adult.id) {
          if (data.id == adult) {
            return "isAdult";
          }
        }
      };
      setCheckState(checkstat());
    }
    //已開始進行收服或已收服完成
    if (data && data.founddata) {
      //計算capture rate（減去之前認真過的時間）和倒計時-仍是0等
      if (data.founddata.level == 0) {
        catchingCaptureCalc.current =
          (291 - data.capture) * 100 - data.founddata.consumption;
        setCaptureTime(catchingCaptureCalc.current);
        setChangeTime(todayTrainingConvert(catchingCaptureCalc.current));
      }
      //計算收服後，下個等級的所需時間（減去之前認真過的時間）-1等以上
      if (data.founddata.level > 0 && data.founddata.level < 100) {
        oldLevel.current = data.founddata.level;
        nextLevel.current = oldLevel.current + 1;
        nextCalc.current =
          data.levels.levels[nextLevel.current - 1].experience -
          data.levels.levels[oldLevel.current - 1].experience -
          data.founddata.consumption;
        setNextExp(nextCalc.current);
        setChangeTime(todayTrainingConvert(nextCalc.current));
      }
    }
    if (error) {
      alert(error);
      router.push("/");
    }
  }, [getReqUser]);
  //changeLevel function
  const [captureTrigger, setCaptureTrigger] = useState(false); //提升等級之後，改變收服時間的attribute
  useEffect(() => {
    if (changeLevel) {
      setCaptureTrigger(true);
      partConsump.current = 0;
      PokeService.updatePokemon(data.id, changeLevel, 0, realToken);
      //從0等升至1等
      if (changeLevel == 1) {
        data.founddata.level = 1;
        oldLevel.current = 1;
        nextLevel.current = 2;
        nextCalc.current =
          data.levels.levels[1].experience - data.levels.levels[0].experience;
      } else if (changeLevel > 1 && changeLevel < 100) {
        //從1等升至其他等級
        data.founddata.level++;
        oldLevel.current++;
        nextLevel.current++;
        nextCalc.current =
          data.levels.levels[nextLevel.current - 1].experience -
          data.levels.levels[oldLevel.current - 1].experience;
      }
    }
    //store evolution
    const storeEvolution = async () => {
      if (checkState == "isBaby") {
        let { baby, teen } = data.evolution;
        let isStored = await PokeService.checkPokemon(teen.id[0], realToken);
        if (baby.minLevel[0] == null) {
          if (changeLevel == 15 && isStored.data == "unStored") {
            for (let i = 0; i < teen.id.length; i++) {
              await PokeService.addNewPokemon(
                teen.id[i],
                15,
                data.founddata.consumption,
                realToken
              );
            }
          }
        } else {
          if (changeLevel == baby.minLevel[0] && isStored.data == "unStored") {
            for (let i = 0; i < teen.id.length; i++) {
              await PokeService.addNewPokemon(
                teen.id[i],
                changeLevel,
                data.founddata.consumption,
                realToken
              );
            }
          }
        }
      } else if (checkState == "isTeen") {
        let { teen, adult } = data.evolution;
        let isStored = await PokeService.checkPokemon(adult.id[0], realToken);
        if (teen.minLevel[0] == null) {
          if (changeLevel == 30 && isStored.data == "unStored") {
            for (let i = 0; i < adult.id.length; i++) {
              await PokeService.addNewPokemon(
                adult.id[i],
                30,
                data.founddata.consumption,
                realToken
              );
            }
          }
        } else {
          if (changeLevel == teen.minLevel[0] && isStored.data == "unStored") {
            for (let i = 0; i < adult.id.length; i++) {
              await PokeService.addNewPokemon(
                adult.id[i],
                changeLevel,
                data.founddata.consumption,
                realToken
              );
            }
          }
        }
      }
    };
    storeEvolution();
    if (changeLevel == 100) {
      if (checkState == "isBaby") {
        babyJump();
      } else if (checkState == "isTeen") {
        teenJump();
      } else if (checkState == "isAdult") {
        adultJump();
      }
      window.location.reload(true);
    }
  }, [changeLevel]);
  useEffect(() => {
    if (data && changeTime == "00:00:00") {
      if (!changeLevel) {
        if (!data.founddata) {
          setChangeLevel(1);
        } else {
          setChangeLevel(data.founddata.level + 1);
        }
      } else {
        setChangeLevel(changeLevel + 1);
      }
    }
  }, [changeTime]);
  //偵測window寬度、AOS套件
  const [windowSize, setWindowSize] = useState(null);
  useEffect(() => {
    AOS.init();
    setWindowSize(window.innerWidth);
  }, []);
  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      setWindowSize(window.innerWidth);
    });
  }
  //other functions
  //製作番茄鐘
  const [startTraining, setStartTraining] = useState(null);
  const workRecord = useRef(1500);
  const restTime = useRef(300);
  const restRecord = useRef(1);
  const checkTimerFirstRender = useRef(false);
  const timer = useRef(new NanoTimer());
  const totalConsump = useRef(0);
  const [startWork, setStartWork] = useState(false);
  const [startRest, setStartRest] = useState(false);

  function main() {
    setStartWork(true);
    setStartRest(false);
    timer.current.setInterval(work, "", "1s");
    timer.current.setTimeout(workstop, "", "1500s");
  }
  function work() {
    totalConsump.current++;
    partConsump.current++;
    setConsumption(totalConsump.current);
    if (!data.founddata || data.founddata.level == 0) {
      catchingCaptureCalc.current--;
      setChangeTime(todayTrainingConvert(catchingCaptureCalc.current));
    } else if (data.founddata.level >= 1) {
      nextCalc.current--;
      setChangeTime(todayTrainingConvert(nextCalc.current));
    }
    workRecord.current--;
  }
  function rest() {
    restTime.current--;
  }
  function workstop() {
    timer.current.clearInterval();
    alert("休息一下吧～");
    setStartWork(false);
    setStartRest(true);
    timer.current.setInterval(rest, "", "1s");
    if (restRecord.current == 4) {
      timer.current.setTimeout(reststop, "", "900s");
    } else {
      timer.current.setTimeout(reststop, "", "300s");
    }
  }
  function reststop() {
    timer.current.clearInterval();
    alert("開始訓練！");
    workRecord.current = 1500;
    restTime.current = 300;
    restRecord.current++;
    if (restRecord.current == 4) {
      restTime.current = 900;
    } else if (restRecord.current == 5) {
      restRecord.current = 1;
    }
    main();
  }
  //正式
  useEffect(() => {
    if (checkTimerFirstRender.current) {
      if (startTraining) {
        alert("開始訓練！");
        main();
      } else if (startTraining == null) {
        timer.current.clearInterval();
        timer.current.clearTimeout();
        workRecord.current = 1500;
        restTime.current = 300;
        restRecord.current = 1;
        alert("停止訓練！");
      }
    }
    checkTimerFirstRender.current = true;
  }, [startTraining]);
  //確認Pokemon進化階段，是否需跳轉至其它階段
  const babyJump = async () => {
    let { founddata } = data;
    let { evolution } = data;
    let databaseFoundTeen = await PokeService.checkPokemon(
      evolution.teen.id[0],
      realToken
    );
    let databaseFoundAdult = await PokeService.checkPokemon(
      evolution.adult.id[0],
      realToken
    );
    let databaseFound = await PokeService.checkPokemon(data.id, realToken);
    if (!changeLevel && !data.founddata) {
      await PokeService.updatePokemon(
        data.id,
        0,
        databaseFound.data.data[0].consumption + partConsump.current,
        realToken
      );
    } else if (!changeLevel || changeLevel == data.founddata.level) {
      await PokeService.updatePokemon(
        data.id,
        founddata.level,
        databaseFound.data.data[0].consumption + partConsump.current,
        realToken
      );
      if (databaseFoundTeen.data != "unStored") {
        for (let i = 0; i < evolution.teen.id.length; i++) {
          await PokeService.updatePokemon(
            evolution.teen.id[i],
            founddata.level,
            databaseFound.data.data[0].consumption + partConsump.current,
            realToken
          );
        }
      }
      if (databaseFoundAdult.data != "unStored") {
        for (let i = 0; i < evolution.adult.id.length; i++) {
          await PokeService.updatePokemon(
            evolution.adult.id[i],
            founddata.level,
            databaseFound.data.data[0].consumption + partConsump.current,
            realToken
          );
        }
      }
    } else {
      await PokeService.updatePokemon(
        data.id,
        changeLevel,
        databaseFound.data.data[0].consumption + partConsump.current,
        realToken
      );
      if (databaseFoundTeen.data != "unStored") {
        for (let i = 0; i < evolution.teen.id.length; i++) {
          await PokeService.updatePokemon(
            evolution.teen.id[i],
            changeLevel,
            databaseFound.data.data[0].consumption + partConsump.current,
            realToken
          );
        }
      }
      if (databaseFoundAdult.data != "unStored") {
        for (let i = 0; i < evolution.adult.id.length; i++) {
          await PokeService.updatePokemon(
            evolution.adult.id[i],
            changeLevel,
            databaseFound.data.data[0].consumption + partConsump.current,
            realToken
          );
        }
      }
    }
    partConsump.current = 0;
  };
  const teenJump = async () => {
    let { founddata } = data;
    let { evolution } = data;
    let databaseFoundAdult = await PokeService.checkPokemon(
      evolution.adult.id[0],
      realToken
    );
    let databaseFound = await PokeService.checkPokemon(data.id, realToken);
    if (!changeLevel || changeLevel == data.founddata.level) {
      await PokeService.updatePokemon(
        evolution.baby.id,
        founddata.level,
        databaseFound.data.data[0].consumption + partConsump.current,
        realToken
      );
      for (let i = 0; i < evolution.teen.id.length; i++) {
        await PokeService.updatePokemon(
          evolution.teen.id[i],
          founddata.level,
          databaseFound.data.data[0].consumption + partConsump.current,
          realToken
        );
      }
      if (databaseFoundAdult.data != "unStored") {
        for (let i = 0; i < evolution.adult.id.length; i++) {
          await PokeService.updatePokemon(
            evolution.adult.id[i],
            founddata.level,
            databaseFound.data.data[0].consumption + partConsump.current,
            realToken
          );
        }
      }
    } else {
      await PokeService.updatePokemon(
        evolution.baby.id,
        changeLevel,
        databaseFound.data.data[0].consumption + partConsump.current,
        realToken
      );
      for (let i = 0; i < evolution.teen.id.length; i++) {
        await PokeService.updatePokemon(
          evolution.teen.id[i],
          founddata.level,
          databaseFound.data.data[0].consumption + partConsump.current,
          realToken
        );
      }
      if (databaseFoundAdult.data != "unStored") {
        for (let i = 0; i < evolution.adult.id.length; i++) {
          await PokeService.updatePokemon(
            evolution.adult.id[i],
            changeLevel,
            databaseFound.data.data[0].consumption + partConsump.current,
            realToken
          );
        }
      }
    }
    partConsump.current = 0;
  };
  const adultJump = async () => {
    let { founddata } = data;
    let { evolution } = data;
    let databaseFound = await PokeService.checkPokemon(data.id, realToken);
    if (!changeLevel || changeLevel == data.founddata.level) {
      await PokeService.updatePokemon(
        evolution.baby.id,
        founddata.level,
        databaseFound.data.data[0].consumption + partConsump.current,
        realToken
      );
      for (let i = 0; i < evolution.teen.id.length; i++) {
        await PokeService.updatePokemon(
          evolution.teen.id[i],
          founddata.level,
          databaseFound.data.data[0].consumption + partConsump.current,
          realToken
        );
      }
      for (let i = 0; i < evolution.adult.id.length; i++) {
        await PokeService.updatePokemon(
          evolution.adult.id[i],
          founddata.level,
          databaseFound.data.data[0].consumption + partConsump.current,
          realToken
        );
      }
    } else {
      await PokeService.updatePokemon(
        evolution.baby.id,
        changeLevel,
        databaseFound.data.data[0].consumption + partConsump.current,
        realToken
      );
      for (let i = 0; i < evolution.teen.id.length; i++) {
        await PokeService.updatePokemon(
          evolution.teen.id[i],
          changeLevel,
          databaseFound.data.data[0].consumption + partConsump.current,
          realToken
        );
      }
      for (let i = 0; i < evolution.adult.id.length; i++) {
        await PokeService.updatePokemon(
          evolution.adult.id[i],
          changeLevel,
          databaseFound.data.data[0].consumption + partConsump.current,
          realToken
        );
      }
    }
    partConsump.current = 0;
  };
  const jumpStateOrRunTime = async () => {
    if (data.founddata && data.founddata.level == 100) {
      alert("已達最高等級");
      return;
    }
    if (checkState == "isBaby") {
      document.cookie =
        "LastTrainingPokemon=" +
        data.id +
        "; path=/; max-age=2592000; domain=.zeabur.app ;SameSite=None ;Secure=true";
      let checkDocument = await PokeService.checkDocument(realToken);
      if (checkDocument.data == "unStored") {
        await PokeService.addNewDocument(data.id, 0, 0, 0, realToken);
      }
      //觸發番茄鐘
      if (startTraining == null) {
        //若尚未進行收服，則將其存入founddata
        let isStored = await PokeService.checkPokemon(data.id, realToken);
        if (isStored.data == "unStored") {
          await PokeService.addNewPokemon(data.id, 0, 0, realToken);
          catchingCaptureCalc.current = (291 - data.capture) * 100;
          data.founddata = {
            id: data.id,
            level: 0,
            consumption: 0,
          };
        }
        setStartTraining(true);
      } else if (startTraining) {
        setStartTraining(null);
        //將已消耗時間與level算進founddata
        await babyJump();
      }
    } else if (checkState == "isTeen") {
      if (!data.founddata) {
        alert("尚未進化至此階段，請從前一個階段開始訓練。");
        router.push(TRAINING_URL + data.evolution.baby.id);
      } else {
        if (startTraining == null) {
          document.cookie =
            "LastTrainingPokemon=" +
            data.id +
            "; path=/; max-age=2592000; SameSite=lax";
          setStartTraining(true);
        } else if (startTraining) {
          setStartTraining(null);
          //將已消耗時間與level算進founddata
          await teenJump();
        }
      }
    } else if (checkState == "isAdult") {
      if (!data.founddata) {
        alert("尚未進化至此階段，請從前一個階段開始訓練。");
        router.push(TRAINING_URL + data.evolution.teen.id[0]);
      } else {
        if (startTraining == null) {
          document.cookie =
            "LastTrainingPokemon=" +
            data.id +
            "; path=/; max-age=2592000; SameSite=lax";
          setStartTraining(true);
        } else if (startTraining) {
          setStartTraining(null);
          //將已消耗時間與level算進founddata
          await adultJump();
        }
      }
    }
  };
  const interval = useRef(new NanoTimer());
  useEffect(() => {
    const jump = async () => {
      if (checkState == "isBaby") {
        await babyJump();
        partConsump.current = 2;
      } else if (checkState == "isTeen") {
        await teenJump();
        partConsump.current = 2;
      } else if (checkState == "isAdult") {
        await adultJump();
        partConsump.current = 2;
      }
    };
    if (startTraining) {
      interval.current.setInterval(jump, "", "60s");
    } else {
      interval.current.clearInterval();
    }
  }, [startTraining]);
  useEffect(() => {
    const jump = async () => {
      if (checkState == "isBaby") {
        await babyJump();
      } else if (checkState == "isTeen") {
        await teenJump();
      } else if (checkState == "isAdult") {
        await adultJump();
      }
    };
    if (data && consumption != 0) {
      router.events.on("routeChangeStart", jump);
      return () => {
        router.events.off("routeChangeStart", jump);
      };
    }
  }, [router, consumption]);
  useEffect(() => {
    const jump = async () => {
      if (checkState == "isBaby") {
        await babyJump();
      } else if (checkState == "isTeen") {
        await teenJump();
      } else if (checkState == "isAdult") {
        await adultJump();
      }
    };
    if (data && consumption != 0) {
      window.addEventListener("beforeunload", jump);
      return () => {
        window.removeEventListener("beforeunload", jump);
      };
    }
  }, [consumption]);
  //監聽refresh和關閉視窗
  useEffect(() => {
    if (data && consumption != 0) {
      const updateTodayTraining = async (e) => {
        await PokeService.updateTodayTraining(consumption, realToken);
        timer.current.clearInterval();
        timer.current.clearTimeout();
      };
      window.addEventListener("beforeunload", updateTodayTraining);
      return () => {
        window.removeEventListener("beforeunload", updateTodayTraining);
      };
    }
  }, [consumption]);
  useEffect(() => {
    if (data && consumption != 0) {
      const updateTodayTraining = async () => {
        await PokeService.updateTodayTraining(consumption, realToken);
        timer.current.clearInterval();
        timer.current.clearTimeout();
      };
      router.events.on("routeChangeStart", updateTodayTraining);
      return () => {
        router.events.off("routeChangeStart", updateTodayTraining);
      };
    }
  }, [router, consumption]);

  const [mount, setMount] = useState(false);
  useEffect(() => {
    setMount(true);
  }, []);

  const [getEvolve, setGetEvolve] = useState(false);
  useEffect(() => {
    let { baby, teen } = data.evolution;
    if (!baby.minLevel[0]) {
      if (changeLevel == 15) {
        setGetEvolve(true);
      }
    } else if (!teen.minLevel[0]) {
      if (changeLevel == 30) {
        setGetEvolve(true);
      }
    } else if (baby.minLevel[0]) {
      if (changeLevel == baby.minLevel[0]) {
        setGetEvolve(true);
      }
    } else if (teen.minLevel[0]) {
      if (changeLevel == teen.minLevel[0]) {
        setGetEvolve(true);
      }
    }
  }, [changeLevel]);

  return (
    <div>
      <section className={style.whole}>
        {data &&
          mount &&
          (getEvolve
            ? createPortal(
                <section className={style.remind}>
                  <h1 className={style.remindWord}>此Pokemon已進化</h1>
                  <h1 className={style.remindWord}>將同步資料</h1>
                  <button
                    className={style.remindButton}
                    onClick={() => {
                      setGetEvolve(false);
                    }}
                  >
                    我知道了！
                  </button>
                </section>,
                document.body
              )
            : null)}
        <section className={style.top} id="topPage">
          <section className={style.topLeft}>
            <div className={style.circle}>
              {data && <img src={data.sprites} className={style.sprites}></img>}
              {data && <h3 className={style.name}>{data.name}</h3>}
              {data && (
                <h4 className={style._id}>{`(${idConvert(data.id)})`}</h4>
              )}
              <AnimatedProgressProvider
                valueStart={0}
                valueEnd={100}
                duration={1.5}
                easingFunction={easeQuadOut}
              >
                {(value) => {
                  return (
                    <CircularProgressbar
                      value={value}
                      strokeWidth={5}
                      styles={buildStyles({
                        pathTransition: "none",
                        pathColor: "#fff0a1",
                        trailColor: "white",
                        strokeLinecap: "round",
                      })}
                      className={style.workAnimation}
                    />
                  );
                }}
              </AnimatedProgressProvider>
              {startWork && startTraining ? (
                <AnimatedProgressProvider
                  valueStart={0}
                  valueEnd={100}
                  duration={1500}
                  easingFunction={easeLinear}
                >
                  {(value) => {
                    return (
                      <CircularProgressbar
                        value={value}
                        strokeWidth={5}
                        styles={buildStyles({
                          pathTransition: "none",
                          pathColor: "white",
                          trailColor: "#fff0a1",
                          strokeLinecap: "butt",
                        })}
                        className={style.workAnimation}
                      />
                    );
                  }}
                </AnimatedProgressProvider>
              ) : null}
              {startRest && startTraining && restRecord.current < 4 ? (
                <AnimatedProgressProvider
                  valueStart={0}
                  valueEnd={100}
                  duration={300}
                  easingFunction={easeLinear}
                >
                  {(value) => {
                    return (
                      <CircularProgressbar
                        value={value}
                        strokeWidth={5}
                        styles={buildStyles({
                          pathTransition: "none",
                          pathColor: "#fff0a1",
                          trailColor: "white",
                          strokeLinecap: "butt",
                        })}
                        className={style.workAnimation}
                      />
                    );
                  }}
                </AnimatedProgressProvider>
              ) : null}
              {startRest && startTraining && restRecord.current == 4 ? (
                <AnimatedProgressProvider
                  valueStart={0}
                  valueEnd={100}
                  duration={900}
                  easingFunction={easeLinear}
                >
                  {(value) => {
                    return (
                      <CircularProgressbar
                        value={value}
                        strokeWidth={5}
                        styles={buildStyles({
                          pathTransition: "none",
                          pathColor: "#fff0a1",
                          trailColor: "white",
                          strokeLinecap: "butt",
                        })}
                        className={style.workAnimation}
                      />
                    );
                  }}
                </AnimatedProgressProvider>
              ) : null}
            </div>
          </section>
          <section className={style.topRight}>
            <div className={style.topRightData}>
              <div className={style.topBlock}>
                {changeLevel ? (
                  <h2
                    className={style.topBlockLevel}
                  >{`Lv. ${changeLevel}`}</h2>
                ) : (
                  (data && !data.founddata && (
                    <h2 className={style.topBlockLevel}>Lv. 0</h2>
                  )) ||
                  (data && data.founddata && (
                    <h2
                      className={style.topBlockLevel}
                    >{`Lv. ${data.founddata.level}`}</h2>
                  ))
                )}
                <img
                  src="/training/currentLevel.png"
                  className={style.currentLevel}
                ></img>
              </div>
              <div className={style.belowCurrentLevel}>
                <div className={style.left}>
                  <div className={style.captureBlock}>
                    <h4
                      className={style.capture}
                      data-stroke={
                        captureTrigger
                          ? `收服時間 ➜ 已收服`
                          : (data &&
                              !data.founddata &&
                              `收服時間 ➜ ${changeTime}`) ||
                            (data &&
                              data.founddata &&
                              data.founddata.level > 0 &&
                              `收服時間 ➜ 已收服`) ||
                            (data &&
                              data.founddata &&
                              data.founddata.level == 0 &&
                              `收服時間 ➜ ${changeTime}`)
                      }
                    >
                      {captureTrigger
                        ? `收服時間 ➜ 已收服`
                        : (data &&
                            !data.founddata &&
                            `收服時間 ➜ ${changeTime}`) ||
                          (data &&
                            data.founddata &&
                            data.founddata.level > 0 &&
                            `收服時間 ➜ 已收服`) ||
                          (data &&
                            data.founddata &&
                            data.founddata.level == 0 &&
                            `收服時間 ➜ ${changeTime}`)}
                    </h4>
                  </div>
                  <div className={style.growthBlock}>
                    <h4
                      className={style.growth}
                      data-stroke={
                        (data &&
                          data.founddata &&
                          data.founddata.level == 100 &&
                          `下個等級 ➜ MAX`) ||
                        (data &&
                          !data.founddata &&
                          `下個等級 ➜ ${changeTime}`) ||
                        (data &&
                          data.founddata &&
                          data.founddata.level > 0 &&
                          `下個等級 ➜ ${changeTime}`) ||
                        (data &&
                          data.founddata &&
                          data.founddata.level == 0 &&
                          `下個等級 ➜ ${changeTime}`)
                      }
                    >
                      下個等級 ➜{" "}
                      {(data &&
                        data.founddata &&
                        data.founddata.level == 100 &&
                        "MAX") ||
                        (data && !data.founddata && changeTime) ||
                        (data &&
                          data.founddata &&
                          data.founddata.level > 0 &&
                          changeTime) ||
                        (data &&
                          data.founddata &&
                          data.founddata.level == 0 &&
                          changeTime)}
                    </h4>
                  </div>
                </div>
                <div className={style.right}>
                  <div
                    className={style.trainingButton}
                    onClick={jumpStateOrRunTime}
                  >
                    <img
                      src="/training/press-button.png"
                      className={style.press}
                    ></img>
                    <h4 className={style.startAndPause} data-stroke="開始訓練">
                      {startTraining ? "暫停訓練" : "開始訓練"}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>
        <section className={style.bottom}>
          <section
            className={style.bottomLeft}
            data-aos="fade-up"
            data-aos-duration="1000"
          >
            <div className={style.data}>
              <div className={style.topData}>
                <div className={style.left}>
                  <h4
                    className={style.height}
                    data-stroke={data && `身高： ${data.height / 10}m`}
                  >
                    {data && `身高： ${data.height / 10}m`}
                  </h4>
                  <h4
                    className={style.weight}
                    data-stroke={data && `體重： ${data.weight / 10}kg`}
                  >
                    {data && `體重： ${data.weight / 10}kg`}
                  </h4>
                  {/* gender（0:男／1~7:男女／8:女／-1:無） */}
                  <h4
                    className={style.gender}
                    data-stroke={
                      (data && data.gender == 0 && `性別： ♂`) ||
                      (data &&
                        data.gender > 0 &&
                        data.gender < 8 &&
                        `性別： ♂♀`) ||
                      (data && data.gender == 8 && `性別： ♀`) ||
                      (data && data.gender < 0 && `性別： 無`)
                    }
                  >
                    性別：&nbsp;
                    {(data && data.gender == 0 && (
                      <span style={{ color: "blue" }}>♂</span>
                    )) ||
                      (data && data.gender > 0 && data.gender < 8 && (
                        <div style={{ display: "inline" }}>
                          <span style={{ color: "blue" }}>♂</span>
                          <span style={{ color: "red" }}>♀</span>
                        </div>
                      )) ||
                      (data && data.gender == 8 && (
                        <span style={{ color: "red" }}>♀</span>
                      )) ||
                      (data && data.gender < 0 && `無`)}
                  </h4>
                </div>
                <div className={style.right}>
                  <h4
                    className={style.genera}
                    data-stroke={data && `分類： ${data.genera}`}
                  >
                    {data && `分類： ${data.genera}`}
                  </h4>
                  <h4
                    className={style.ability}
                    data-stroke={data && `特性： ${data.ability}`}
                  >
                    {data && `特性： ${data.ability}`}
                  </h4>
                </div>
              </div>
              <div className={style.bottomData}>
                <h4 className={style.type}>
                  屬性：
                  {data &&
                    arrayType &&
                    arrayType.map((type) => {
                      return (
                        <span
                          className={`${style.typeName} ${type}`}
                          key={type}
                        >
                          {type}
                        </span>
                      );
                    })}
                </h4>
                <h4 className={style.weakness}>
                  弱點：
                  {data &&
                    arrayWeak &&
                    arrayWeak.map((weak) => {
                      return (
                        <span
                          className={`${style.weakName} ${weak}`}
                          key={weak}
                        >
                          {weak}
                        </span>
                      );
                    })}
                </h4>
              </div>
            </div>
          </section>
          <section
            className={style.bottomRight}
            data-aos="zoom-in-up"
            data-aos-duration="1000"
          >
            <div className={style.data}>
              {windowSize >= 1150 && (
                <div className={style.arrow}>
                  <img
                    src="/training/arrow-30.png"
                    className={style.arrow_30}
                  ></img>
                  <img
                    src="/training/arrow-135.png"
                    className={style.arrow_135}
                  ></img>
                </div>
              )}
              <div
                className={style.evolve1}
                onClick={(e) => {
                  if (data) {
                    router.push(TRAINING_URL + data.evolution.baby.id);
                  }
                }}
              >
                {data && (
                  <img
                    src={data.evolution.baby.sprites}
                    className={style.evol1sprites}
                  ></img>
                )}
                {data && (
                  <h3 className={style.evol1name}>
                    {data.evolution.baby.twName}
                  </h3>
                )}
                {data && (
                  <h4 className={style.evol1id}>{`(${idConvert(
                    data.evolution.baby.id
                  )})`}</h4>
                )}
              </div>
              <div className={style.evolve2}>
                {data && data.evolution.teen.name.length > 1 && (
                  <div
                    className={style.evol2button}
                    onClick={(e) => {
                      if (data) {
                        router.push(
                          TRAINING_URL + data.evolution.teen.id[evolTeen - 1]
                        );
                      }
                    }}
                  >
                    <img
                      className={style.evol2Right}
                      src="/training/right-arrow.png"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (evolTeen == data.evolution.teen.name.length) {
                          setEvolTeen(1);
                        } else {
                          setEvolTeen(evolTeen + 1);
                        }
                      }}
                    ></img>
                    <img
                      className={style.evol2Left}
                      src="/training/left-arrow.png"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (evolTeen == 1) {
                          setEvolTeen(data.evolution.teen.name.length);
                        } else {
                          setEvolTeen(evolTeen - 1);
                        }
                      }}
                    ></img>
                  </div>
                )}
                {data && data.evolution.teen.name.length >= 1 && (
                  <div
                    className={style.evol2block}
                    onClick={(e) => {
                      if (data) {
                        router.push(
                          TRAINING_URL + data.evolution.teen.id[evolTeen - 1]
                        );
                      }
                    }}
                  >
                    {data && evolTeen >= 1 && (
                      <img
                        src={data.evolution.teen.sprites[evolTeen - 1]}
                        className={style.evol2sprites}
                      ></img>
                    )}
                    {data && evolTeen >= 1 && (
                      <h3 className={style.evol2name}>
                        {data.evolution.teen.twName[evolTeen - 1]}
                      </h3>
                    )}
                    {data && evolTeen >= 1 && (
                      <h4 className={style.evol2id}>{`(${idConvert(
                        data.evolution.teen.id[evolTeen - 1]
                      )})`}</h4>
                    )}
                  </div>
                )}
                {data && data.evolution.teen.name.length == 0 && (
                  <img
                    className={style.evol2Cross}
                    src="/training/cross.png"
                  ></img>
                )}
              </div>
              <div className={style.evolve3}>
                {data && data.evolution.adult.name.length > 1 && (
                  <div
                    className={style.evol3button}
                    onClick={(e) => {
                      if (data) {
                        router.push(
                          TRAINING_URL + data.evolution.adult.id[evolAdult - 1]
                        );
                      }
                    }}
                  >
                    <img
                      className={style.evol3Right}
                      src="/training/right-arrow.png"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (evolAdult == data.evolution.adult.name.length) {
                          setEvolAdult(1);
                        } else {
                          setEvolAdult(evolAdult + 1);
                        }
                      }}
                    ></img>
                    <img
                      className={style.evol3Left}
                      src="/training/left-arrow.png"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (evolAdult == 1) {
                          setEvolAdult(data.evolution.adult.name.length);
                        } else {
                          setEvolAdult(evolAdult - 1);
                        }
                      }}
                    ></img>
                  </div>
                )}
                {data && data.evolution.adult.name.length >= 1 && (
                  <div
                    className={style.evol3block}
                    onClick={(e) => {
                      if (data) {
                        router.push(
                          TRAINING_URL + data.evolution.adult.id[evolAdult - 1]
                        );
                      }
                    }}
                  >
                    {data && evolAdult >= 1 && (
                      <img
                        src={data.evolution.adult.sprites[evolAdult - 1]}
                        className={style.evol3sprites}
                      ></img>
                    )}
                    {data && evolAdult >= 1 && (
                      <h3 className={style.evol3name}>
                        {data.evolution.adult.twName[evolAdult - 1]}
                      </h3>
                    )}
                    {data && evolAdult >= 1 && (
                      <h4 className={style.evol3id}>{`(${idConvert(
                        data.evolution.adult.id[evolAdult - 1]
                      )})`}</h4>
                    )}
                  </div>
                )}
                {data && data.evolution.adult.name.length == 0 && (
                  <img
                    className={style.evol3Cross}
                    src="/training/cross.png"
                  ></img>
                )}
              </div>
            </div>
          </section>
        </section>
      </section>
    </div>
  );
}
