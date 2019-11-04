require("dotenv").config();
var keys = require("./keys.js");

axios = require("axios");

/*console.log(keys.OMDB.key);
console.log(keys.spotify.id);
console.log(keys.spotify.secret);
console.log(keys.BIT.id);*/

var command = process.argv[2];
var args = process.argv.splice(3).join("+");



var OMDB = {
    queryUrl:`http://www.omdbapi.com/?apikey=${keys.OMDB.key}&y=&plot=short&t=`,

    query:function (movie){
        axios.get(this.queryUrl+movie).then(
            function(response) {
                if(response.data.Response === "True"){
                    console.log(`${response.data.Title} came out in ${response.data.Year}.`);
                    console.log(`IMDB gave it a score of ${response.data.imdbRating} while Rotten Tomatoes gave it a ${response.data.Ratings[1].Value}.`);
                    console.log(`The movie was produced in ${response.data.Country} and had the languages ${response.data.Language}.`);
                    console.log(`The plot of the movie is: "${response.data.Plot}"`);
                    console.log(`Its main actors are ${response.data.Actors}.`);
                }
                else console.log(response.data.Error);
            })
            .catch(function(error) {
              console.log(error);
            });
    },
}

OMDB.query(args);