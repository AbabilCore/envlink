import { Router } from "express";
import envlinkApi from "./envlink/route";
import statsApi from "./stats/route";

const apis = Router();

apis.use("/envlinks", envlinkApi);
apis.use("/stats", statsApi);

export default apis;
