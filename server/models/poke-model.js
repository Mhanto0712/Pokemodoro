import mongoose from "mongoose";
const { Schema } = mongoose;

const pokeSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  data: {
    type: [
      {
        _id: Number,
        level: Number,
        consumption: Number,
      },
    ],
    default: [],
  },
  todayTraining: {
    type: Number,
    default: 0,
  },
});

//instance methods
pokeSchema.methods.sortDataBy_id = (arr) => {
  let newArr = arr.sort((a, b) => a._id - b._id);
  return newArr;
};
pokeSchema.methods.sortDataByLevel = (arr) => {
  let newArr = arr.sort((a, b) => b.level - a.level);
  return newArr;
};

export default mongoose.model("Pokemon", pokeSchema);
