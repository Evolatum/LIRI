require("dotenv").config();
var keys = require("./keys.js");

axios = require("axios");

console.log(keys.OMDB.key);
console.log(keys.spotify.id);
console.log(keys.spotify.secret);