require("dotenv").config();
var keys = require("./keys.js");

var axios = require("axios");
var moment = require('moment');

//console.log(keys.spotify.id);
//console.log(keys.spotify.secret);

var command = process.argv[2];
var args = process.argv.slice(3).join("+");



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

var BIT = {
    queryUrl:[`https://rest.bandsintown.com/artists/`,`/events?app_id=${keys.BIT.id}`],

    query:function (band){
        axios.get(this.queryUrl[0]+band+this.queryUrl[1]).then(
            function(response) {
                for(event of response.data){
                    console.log(`Venue: ${event.venue.name} in ${event.venue.city}, ${event.venue.country}`);
                    console.log(moment(event.datetime).format("MM/DD/YYYY"));
                    console.log();
                    //Date of the Event (use moment to format this as "MM/DD/YYYY")
                }
            })
            .catch(function(error) {
              console.log(error);
            });
    },
}

switch(command){
    case "movie-this":
        OMDB.query(args);
        break;
    case "concert-this":
        BIT.query(args);
        break;
    default:
        console.log("Invalid command...");
}