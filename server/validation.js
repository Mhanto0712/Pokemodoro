import Joi from "joi";

//驗證碼信箱 validation
const sendCAPTCHAValid = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .pattern(/^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/)
      .required()
      .messages({
        "string.empty": "信箱為必填。",
        "string.pattern.base": "請輸入正確的信箱格式。",
      }),
  });

  return schema.validate(data);
};
//Local signup validation
const localSignUpValid = (data) => {
  const schema = Joi.object({
    signUpType: Joi.string().valid("local", "google").required().messages({
      "any.required": "註冊種類儲存失敗（無此屬性），請聯絡開發者。",
      "string.empty": "註冊種類儲存失敗（輸入值為空），請聯絡開發者。",
      "any.only": "註冊種類輸入值錯誤，請聯絡開發者。",
    }),
    username: Joi.string()
      .min(1)
      .max(6)
      .pattern(/^[a-zA-Z0-9\u4e00-\u9fa5]+$/)
      .required()
      .messages({
        "any.required": "用戶名儲存失敗（無此屬性），請聯絡開發者。",
        "string.empty": "用戶名為必填。",
        "string.min": "用戶名的最小長度為1。",
        "string.max": "用戶名的最大長度為6。",
        "string.pattern.base": "用戶名只能包含中文、英文與數字。",
      }),
    email: Joi.string()
      .pattern(/^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/)
      .required()
      .messages({
        "any.required": "信箱儲存失敗（無此屬性），請聯絡開發者。",
        "string.empty": "信箱為必填。",
        "string.pattern.base": "請輸入正確的信箱格式。",
      }),
    password: Joi.string()
      .min(8)
      .max(20)
      .required()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])[A-Za-z0-9\!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?]+$/
      )
      .messages({
        "any.required": "密碼儲存失敗（無此屬性），請聯絡開發者。",
        "string.empty": "密碼為必填。",
        "string.min": "密碼的最小長度為8。",
        "string.max": "密碼的最大長度為20。",
        "string.pattern.base":
          "密碼需包含至少一大寫英文字、一小寫英文字、一數字以及一特殊符號，且不得包含英文外的其他語言。",
      }),
    code: Joi.string().required().messages({
      "string.empty": "email驗證碼為必填。",
    }),
  });

  return schema.validate(data);
};
//Local signIn validation
const localSignInValid = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .pattern(/^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/)
      .required()
      .messages({
        "any.required": "信箱儲存失敗（無此屬性），請聯絡開發者。",
        "string.empty": "信箱為必填。",
        "string.pattern.base": "請輸入正確的信箱格式。",
      }),
    password: Joi.string()
      .min(8)
      .max(20)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])[A-Za-z0-9\!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?]+$/
      )
      .required()
      .messages({
        "any.required": "密碼儲存失敗（無此屬性），請聯絡開發者。",
        "string.empty": "密碼為必填。",
        "string.min": "密碼的最小長度為8。",
        "string.max": "密碼的最大長度為20。",
        "string.pattern.base":
          "密碼需包含至少一大寫英文字、一小寫英文字、一數字以及一特殊符號，且不得包含英文外的其他語言。",
      }),
  });

  return schema.validate(data);
};
//更改username validation
const editUsernameValid = (data) => {
  const schema = Joi.object({
    username: Joi.string()
      .min(1)
      .max(6)
      .pattern(/^[a-zA-Z0-9\u4e00-\u9fa5]+$/)
      .required()
      .messages({
        "any.required": "用戶名儲存失敗（無此屬性），請聯絡開發者。",
        "string.empty": "用戶名為必填。",
        "string.min": "用戶名的最小長度為1。",
        "string.max": "用戶名的最大長度為6。",
        "string.pattern.base": "用戶名只能包含中文、英文與數字。",
      }),
  });

  return schema.validate(data);
};

//變更密碼 validation
const editpasswordValid = (data) => {
  const schema = Joi.object({
    signUpType: Joi.string().valid("local", "google").required().messages({
      "any.required": "註冊種類儲存失敗（無此屬性），請聯絡開發者。",
      "string.empty": "註冊種類儲存失敗（輸入值為空），請聯絡開發者。",
      "any.only": "註冊種類輸入值錯誤，請聯絡開發者。",
    }),
    email: Joi.string()
      .pattern(/^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/)
      .required()
      .messages({
        "any.required": "信箱儲存失敗（無此屬性），請聯絡開發者。",
        "string.empty": "信箱為必填。",
        "string.pattern.base": "請輸入正確的信箱格式。",
      }),
    password: Joi.string()
      .min(8)
      .max(20)
      .required()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])[A-Za-z0-9\!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?]+$/
      )
      .messages({
        "any.required": "密碼儲存失敗（無此屬性），請聯絡開發者。",
        "string.empty": "密碼為必填。",
        "string.min": "密碼的最小長度為8。",
        "string.max": "密碼的最大長度為20。",
        "string.pattern.base":
          "密碼需包含至少一大寫英文字、一小寫英文字、一數字以及一特殊符號，且不得包含英文外的其他語言。",
      }),
    code: Joi.string().required().messages({
      "string.empty": "email驗證碼為必填。",
    }),
  });

  return schema.validate(data);
};

export {
  localSignUpValid,
  localSignInValid,
  sendCAPTCHAValid,
  editUsernameValid,
  editpasswordValid,
};
