import express from "express";
const router = express.Router();
import Pokedex from "pokedex-promise-v2";
const P = new Pokedex();
import Pokemon from "../models/poke-model.js";
import axios from "axios";

//收服＆訓練時刻
//取得sprites, name, _id, level, consumption, capture, growth, height, weight, gender, genus, ability, type, weakness, evolution
router.get("/training/:_id", async (req, res) => {
  let { _id } = req.params;
  let foundPokemon = await Pokemon.findOne({ user: req.user._id });
  let founddata;
  let remind = null;
  if (!foundPokemon) {
    founddata = null;
    remind = "尚未建立Pokemon document。";
  } else {
    founddata = foundPokemon.data.find((d) => d._id == _id);
    if (!founddata) {
      founddata = null;
      remind = "此Pokemon尚未進行收服＆訓練";
    } else if (founddata.level == 0) {
      remind = "此Pokemon尚未收服完成";
    }
  }
  let APIone = await P.getPokemonByName(_id);
  let APItwo = await P.getPokemonSpeciesByName(_id);
  let APIthree = (await axios.get(APItwo.evolution_chain.url)).data;
  //屬性與弱點loop查詢
  let typeAndWeakLoop = async () => {
    let result = {
      type: {},
      weak: {},
      half: {},
    };
    for (let i = 0; i < APIone.types.length; i++) {
      result.type[i] = APIone.types[i].type.name;
      result.weak[i] = (
        await P.getTypeByName(result.type[i])
      ).damage_relations.double_damage_from;
      result.half[i] = (
        await P.getTypeByName(result.type[i])
      ).damage_relations.half_damage_from;
    }
    return result;
  };
  let typeAndWeak = await typeAndWeakLoop();
  //進化loop查詢
  let evolutionLoop = async () => {
    let evolution = {
      baby: {
        name: APIthree.chain.species.name,
        minLevel: [],
        url: APIthree.chain.species.url,
        twName: "",
      },
      teen: {
        name: [],
        minLevel: [],
        url: [],
        twName: [],
      },
      adult: { name: [], url: [], twName: [] },
    };
    let twBabyName = await axios.get(APIthree.chain.species.url);
    evolution.baby.twName = twBabyName.data.names[3].name;
    for (let b = 0; b < APIthree.chain.evolves_to.length; b++) {
      evolution.baby.minLevel.push(
        APIthree.chain.evolves_to[b].evolution_details[0].min_level
      );
      evolution.teen.name.push(APIthree.chain.evolves_to[b].species.name);
      evolution.teen.url.push(APIthree.chain.evolves_to[b].species.url);
      let twName = await axios.get(APIthree.chain.evolves_to[b].species.url);
      evolution.teen.twName.push(twName.data.names[3].name);
      for (let t = 0; t < APIthree.chain.evolves_to[b].evolves_to.length; t++) {
        evolution.teen.minLevel.push(
          APIthree.chain.evolves_to[b].evolves_to[t].evolution_details[0]
            .min_level
        );
        evolution.adult.name.push(
          APIthree.chain.evolves_to[b].evolves_to[t].species.name
        );
        evolution.adult.url.push(
          APIthree.chain.evolves_to[b].evolves_to[t].species.url
        );
        let twName = await axios.get(
          APIthree.chain.evolves_to[b].evolves_to[t].species.url
        );
        evolution.adult.twName.push(twName.data.names[3].name);
      }
    }
    return evolution;
  };
  let evolution = await evolutionLoop();
  return res.send({
    id: APIone.id,
    name: APItwo.names[3].name,
    founddata,
    remind,
    sprites: APIone.sprites.other["official-artwork"].front_default,
    capture: APItwo.capture_rate,
    growth: APItwo.growth_rate.name,
    height: APIone.height,
    weight: APIone.weight,
    gender: APItwo.gender_rate,
    genera: APItwo.genera[2].genus,
    ability: APIone.abilities[0].ability.name,
    typeAndWeak,
    evolution,
  });
});
//首次訓練時會存入的pokemon資料：_id, level,consumption,todayTraining
router.post("/training", async (req, res) => {
  let { _id, level, consumption, todayTraining } = req.body;
  let newPokemon = new Pokemon({
    user: req.user._id,
    data: { _id, level, consumption },
    todayTraining,
  });
  try {
    let savedPokemon = await newPokemon.save();
    return res.send({
      msg: "成功儲存！",
      Pokemon資料為: savedPokemon,
    });
  } catch (e) {
    return res.status(500).send(e);
  }
});
//往後訓練時會添加的新pokemon資料：_id, level, consumption
router.patch("/training/add", async (req, res) => {
  let { _id, level, consumption } = req.body;
  try {
    let updatedPokemon = await Pokemon.findOneAndUpdate(
      { user: req.user._id },
      { $push: { data: { _id, level, consumption } } },
      {
        new: true,
        runValidators: true,
      }
    ).exec();
    return res.send({
      msg: "成功更新！",
      Pokemon資料為: updatedPokemon,
    });
  } catch (e) {
    return res.status(500).send(e);
  }
});
//往後訓練時會更新的舊pokemon資料：level, consumption
router.patch("/training/update/:_id", async (req, res) => {
  let { _id } = req.params;
  let { level, consumption } = req.body;
  try {
    let updatedPokemon = await Pokemon.findOneAndUpdate(
      { user: req.user._id, "data._id": _id },
      { $set: { "data.$.level": level, "data.$.consumption": consumption } },
      {
        new: true,
        runValidators: true,
      }
    ).exec();
    return res.send({
      msg: "成功更新！",
      Pokemon資料為: updatedPokemon,
    });
  } catch (e) {
    return res.status(500).send(e);
  }
});
//確認該Pokemon是否已在本帳的數據庫內（防止重複儲存）
router.get("/checkPoke/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let checkPokemon = await Pokemon.findOne(
      { user: req.user._id, "data._id": _id },
      { "data.$": 1 }
    ).exec();
    if (!checkPokemon) {
      return res.send("unStored");
    }
    return res.send(checkPokemon);
  } catch (e) {
    return res.status(500).send(e);
  }
});
//更新todayTraining
router.patch("/todayTraining", async (req, res) => {
  let { consumption } = req.body;
  try {
    let updatedPokemon = await Pokemon.findOneAndUpdate(
      { user: req.user._id },
      { $inc: { todayTraining: consumption } },
      {
        new: true,
        runValidators: true,
      }
    ).exec();
    return res.send({
      msg: "成功更新！",
      todayTraining: updatedPokemon.todayTraining,
    });
  } catch (e) {
    return res.status(500).send(e);
  }
});
//確認該使用者是否有Pokemon document
router.get("/checkDocument", async (req, res) => {
  try {
    let checkDocument = await Pokemon.findOne({ user: req.user._id }).exec();
    if (!checkDocument) {
      return res.send("unStored");
    }
    return res.send(checkDocument._id);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//我的pokemon
//My pokemon constructor
class Mypokemon {
  constructor(thumb, id, name, level) {
    (this.thumb = thumb),
      (this.id = id),
      (this.name = name),
      (this.level = level);
  }
}
//取得已有的pokemon：sprites, _id, name, level, todayTraing, 已收服數量
router.get("/mypokemon/page/:page", async (req, res) => {
  let { page } = req.params;
  let result = [];
  //確認是否開始進行收服
  let foundPokemon = await Pokemon.findOne({ user: req.user._id });
  if (!foundPokemon) {
    return res
      .status(400)
      .send("尚未開始收服Pokemon，請先至尋找Pokemon進行收服。");
  }
  let { data, todayTraining } = foundPokemon;
  let copyData = data.map((d) => d);
  let highestLevel = foundPokemon.sortDataByLevel(copyData)[0].level;
  let newData = foundPokemon.sortDataBy_id(
    copyData.filter((d) => d.level != 0)
  );
  let { length } = newData;
  let initial = page * 6;
  let end = initial + 6;
  while (initial < newData.length && initial < end) {
    let APIone = await P.getPokemonByName(newData[initial]._id);
    let APItwo = await P.getPokemonSpeciesByName(newData[initial]._id);
    let obj = new Mypokemon(
      APIone.sprites.front_default,
      APIone.id,
      APItwo.names[3].name,
      newData[initial].level
    );
    result.push(obj);
    initial++;
  }
  return res.send({
    todayTraining,
    length,
    highestLevel,
    end,
    result,
  });
});
//取得搜尋的pokemon(by _id)：sprites, _id, name, level
router.get("/mypokemon/search/:_id", async (req, res) => {
  let { _id } = req.params;
  let foundPokemon = await Pokemon.findOne({ user: req.user._id });
  let { data, todayTraining } = foundPokemon;
  let copyData = data.map((d) => d);
  let highestLevel = foundPokemon.sortDataByLevel(copyData)[0].level;
  let filterData = copyData.filter((d) => d.level != 0);
  let { length } = filterData;
  let found_idArr = filterData.map((d) => d._id);
  if (found_idArr.find((n) => n == _id)) {
    let APIone = await P.getPokemonByName(_id);
    let APItwo = await P.getPokemonSpeciesByName(_id);
    let obj = new Mypokemon(
      APIone.sprites.front_default,
      APIone.id,
      APItwo.names[3].name
    );
    return res.send({
      obj,
      data: filterData.find((d) => d._id == _id),
      todayTraining,
      length,
      highestLevel,
    });
  } else if (0 < _id && _id <= 905) {
    return res.status(400).send("尚未收服此pokemon，請至尋找pokemon查找。");
  } else {
    return res.status(400).send("找不到此pokemon，請確認輸入的id");
  }
});

//尋找寶可夢
//取得所有pokemon（不包括已有的pokemon）：sprites, _id, name, todayTraing, 未收服數量
router.get("/findpokemon/page/:page", async (req, res) => {
  let { page } = req.params;
  let result = [];
  let foundPokemon = await Pokemon.findOne({ user: req.user._id });
  if (!foundPokemon) {
    let filterData = Array.from(
      { length: 905 },
      (_id, index) => (_id = index + 1)
    );
    let { length } = filterData;
    let initial = page * 6;
    let end = initial + 6;
    while (initial < filterData.length && initial < end) {
      let APIone = await P.getPokemonByName(filterData[initial]);
      let APItwo = await P.getPokemonSpeciesByName(filterData[initial]);
      let obj = new Mypokemon(
        APIone.sprites.front_default,
        APIone.id,
        APItwo.names[3].name
      );
      result.push(obj);
      initial++;
    }
    return res.send({
      length,
      result,
      end,
    });
  }
  let { data, todayTraining } = foundPokemon;
  let copyData = data.map((d) => d);
  let filterCopyData = copyData.filter((d) => d.level != 0);
  let newData = foundPokemon.sortDataBy_id(filterCopyData);
  let new_idData = newData.map((d) => d._id);
  let allAPIData = Array.from(
    { length: 905 },
    (_id, index) => (_id = index + 1)
  );
  let filterData = allAPIData.filter((d) => new_idData.indexOf(d) == -1);
  let { length } = filterData;
  let initial = page * 6;
  let end = initial + 6;
  while (initial < filterData.length && initial < end) {
    let APIone = await P.getPokemonByName(filterData[initial]);
    let APItwo = await P.getPokemonSpeciesByName(filterData[initial]);
    let obj = new Mypokemon(
      APIone.sprites.front_default,
      APIone.id,
      APItwo.names[3].name
    );
    result.push(obj);
    initial++;
  }
  return res.send({
    todayTraining,
    length,
    result,
    end,
  });
});
//取得搜尋的pokemon(by _id)：sprites, _id, name
router.get("/findpokemon/search/:_id", async (req, res) => {
  let { _id } = req.params;
  let foundPokemon = await Pokemon.findOne({ user: req.user._id });
  if (!foundPokemon) {
    if (0 < _id && _id <= 905) {
      let APIone = await P.getPokemonByName(_id);
      let APItwo = await P.getPokemonSpeciesByName(_id);
      let obj = new Mypokemon(
        APIone.sprites.front_default,
        APIone.id,
        APItwo.names[3].name
      );
      return res.send({
        obj,
        length: 905,
      });
    } else {
      return res.status(400).send("找不到此pokemon，請確認輸入的id");
    }
  }
  let { data, todayTraining } = foundPokemon;
  let copyData = data.map((d) => d);
  let filterData = copyData.filter((d) => d.level != 0);
  let found_idArr = filterData.map((d) => d._id);
  let allAPIData = Array.from(
    { length: 905 },
    (_id, index) => (_id = index + 1)
  );
  let unCatchData = allAPIData.filter((d) => found_idArr.indexOf(d) == -1);
  let { length } = unCatchData;
  if (found_idArr.find((n) => n == _id)) {
    return res.status(400).send("已收服此pokemon，請至我的pokemon查找。");
  } else if (0 < _id && _id <= 905) {
    let APIone = await P.getPokemonByName(_id);
    let APItwo = await P.getPokemonSpeciesByName(_id);
    let obj = new Mypokemon(
      APIone.sprites.front_default,
      APIone.id,
      APItwo.names[3].name
    );
    return res.send({
      obj,
      todayTraining,
      length,
    });
  } else {
    return res.status(400).send("找不到此pokemon，請確認輸入的id");
  }
});

export default router;
