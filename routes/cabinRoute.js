const express = require("express");
const CabinFunctions = require("../functions/cabinFunctions");
const auth = require("../middleware/auth");
const cabinRoute = express.Router();
const cabinFunctions = new CabinFunctions();

cabinRoute.get("/", auth, async (req, res) => {
  console.log("Cookies:", req.cookies);
  try {
    const { status, json } = await cabinFunctions.getAllCabins();
    res.status(status).send(json);
  } catch (error) {
    res.status(500).send({ success: false, message: "something went wrong" });
  }
});

cabinRoute.get("/:cabinId", async (req, res) => {
  try {
    const { status, json } = await cabinFunctions.getCabin({
      cabinId: req.params.cabinId,
    });
    res.status(status).send(json);
  } catch (error) {
    res.status(500).send({ success: false, message: "something went wrong" });
  }
});

module.exports = cabinRoute;
