const mongoose = require("mongoose");

const cabinSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    maxCapacity: {
      type: Number,
    },
    regularPrice: {
      type: Number,
    },
    discount: {
      type: Number,
    },
    image: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Cabin = mongoose.model("cabins", cabinSchema);

module.exports = Cabin;
