const Cabin = require("../models/cabinModel");

class CabinFunctions {
  async getAllCabins() {
    try {
      const cabins = await Cabin.find();
      if (!cabins) {
        return {
          status: 404,
          json: {
            success: false,
            message: "No cabins found",
          },
        };
      }
      return {
        status: 200,
        json: {
          success: true,
          cabins,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        status: 500,
        json: {
          success: false,
          message: "something went wrong",
        },
      };
    }
  }

  async getCabin({ cabinId }) {
    try {
      const cabin = await Cabin.findById(cabinId);
      return {
        status: 200,
        json: {
          success: true,
          cabin,
        },
      };
    } catch (error) {
      return {
        status: 500,
        json: {
          success: false,
          message: "something went wrong",
        },
      };
    }
  }
}

module.exports = CabinFunctions;
