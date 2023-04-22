import axios from "axios";
const API_URL = "https://pokemodoro-server.zeabur.app/poke";

axios.defaults.withCredentials = true;

class PokeService {
  //確認該Pokemon是否已被儲存
  checkPokemon(_id, token) {
    return axios.get(API_URL + "/checkPoke/" + _id, {
      headers: {
        Authorization: token,
      },
    });
  }
  //添加新的Pokemon
  addNewPokemon(_id, level, consumption, token) {
    return axios.patch(
      API_URL + "/training/add",
      {
        _id,
        level,
        consumption,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }
  //更新寶可夢資料
  updatePokemon(_id, level, consumption, token) {
    return axios.patch(
      API_URL + "/training/update/" + _id,
      {
        _id,
        level,
        consumption,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }
  //更新今日訓練時間
  updateTodayTraining(consumption, token) {
    return axios.patch(
      API_URL + "/todayTraining",
      {
        consumption,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }
  //確認該使用者是否有Pokemon document
  checkDocument(token) {
    return axios.get(API_URL + "/checkDocument", {
      headers: {
        Authorization: token,
      },
    });
  }
  //新增使用者的Pokemon document
  addNewDocument(_id, level, consumption, todayTraining, token) {
    return axios.post(
      API_URL + "/training",
      {
        _id,
        level,
        consumption,
        todayTraining,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }
}

export default new PokeService();
