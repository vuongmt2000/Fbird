const Joi = require("joi");
const { errorHandler } = require("../Utils/ResponseHandler");
const err = require("../Errors/index");
const bindError = (error_data) => {
  result = new Error(error_data.messageCode);
  result.success = error_data.success;
  result.data = error_data.data;
  result.message = error_data.message;
  result.code = error_data.code;
  result.messageCode = error_data.messageCode;
  result.status = error_data.status;
  return result;
};

const reg = {
  name: new RegExp(
    /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]{2,}$/
  ),
  phone: new RegExp(
    /^((09[0-9]{8})|(08([1-9])[0-9]{7})|(01(2|6|8|9)[0-9]{8})|(069[2-9][0-9]{4,5})|(080(4|31|511|8)[0-9]{4})|(0([2-8])[0-9]{1,2}[0-9]{1,3}[0-9]{5}))$/
  ),
  image: new RegExp(/([/|.|\w|\s|-])*\.(?:jpg|gif|png)/),
};
const Validators = {

  getCode: Joi.object({
    email: Joi.string()
      .required()
      .email()
      .lowercase()
      .error((e) => new Error(err.INVALID_EMAIL.messageCode)),
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .lowercase()
      .error((e) => new Error(err.INVALID_EMAIL.messageCode)),
    activeCode: Joi.string()
      .required()
      .length(6)
      .error((e) => new Error(err.CODE_WRONG.messageCode)),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  addWallet: Joi.object({
    onChainWallet: Joi.string()
      .required()
      .error((e) => new Error(err.WRONG_WALLET.messageCode)),
    activeCode: Joi.string()
      .required()
      .length(6)
      .error((e) => new Error(err.CODE_WRONG.messageCode)),
  }),
};
const middleware = (validator) => {
  return async function (req, res, next) {
    try {
      const validated = await Validators[validator].validateAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      return errorHandler(res, error);
    }
  };
};

module.exports = {
  auth: {
    getCode: middleware("getCode"),
    login: middleware("login"),
    refreshToken: middleware("refreshToken")
  },
  wallet: {
    addWallet: middleware("addWallet"),
  },
  bindError,
};
