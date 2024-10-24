
const express = require("express");
const router = express.Router();
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const productCollection = client.db("giftap_DB").collection("offers");