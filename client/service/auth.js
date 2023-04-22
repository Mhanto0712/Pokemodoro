import axios from "axios";
const API_URL = "http://localhost:8080/api/user";

axios.defaults.withCredentials = true;

class AuthService {
  //確認是否為登入狀態
  async getCurrentUser() {
    let response = await axios.get(API_URL + "/findCookie");
    return response.data;
  }
  //發送驗證碼
  sendCAPTCHA(email) {
    return axios.post(API_URL + "/sendCAPTCHA", {
      email,
    });
  }
  //本地註冊
  localSignUp(username, email, password, code) {
    return axios.post(API_URL + "/localsignup", {
      username,
      email,
      password,
      code,
    });
  }
  //本地登入
  localSignIn(email, password) {
    return axios.post(API_URL + "/localsignin", {
      email,
      password,
    });
  }
  //拿取登入後個人資料
  getReqUser(token) {
    return axios.get(API_URL + "/", {
      headers: {
        Authorization: token,
      },
    });
  }
  //更改Username
  editUsername(token, username) {
    return axios.patch(
      API_URL + "/editUsername",
      {
        username,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }
  //變更密碼
  editPassword(email, password, code) {
    return axios.patch(API_URL + "/editPassword", {
      email,
      password,
      code,
    });
  }
  //登出
  signOut() {
    localStorage.removeItem("PokemodoroUser");
    axios.get(API_URL + "/deleteCookie");
  }
}

export default new AuthService();
