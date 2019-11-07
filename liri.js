require("dotenv").config();
var keys = require("./keys.js");
var axios = require("axios");
var moment = require('moment');
var inquirer = require("inquirer");

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
                }
            })
            .catch(function(error) {
              console.log(error);
            });
    },
}

var Q = {
    commands:["movie-this","concert-this","spotify-this","exit"],
    askCommand:function(){
        inquirer
        .prompt([
          {
              type: "list",
              message: "What do you want to do:",
              choices: Q.commands,
              name: "choice"
          }
        ])
        .then(function(response) {
            response.choice==="exit"?console.log("Thank you for using interactive mode..."):Q.askArg(response.choice);
        });
    },
    askArg:function(command){
        inquirer
        .prompt([
          {
              type: "input",
              message: `${command}:`,
              name: "args"
          }
        ])
        .then(function(response) {
            switch(command){
                case "movie-this":
                    OMDB.query(response.args);
                    break;
                case "concert-this":
                    BIT.query(response.args);
                    break;
                case "spotify-this":
                    SAPI.query(response.args);
                    break;
            }
        });
    }
}


switch(command){
    case "movie-this":
        OMDB.query(args);
        break;
    case "concert-this":
        BIT.query(args);
        break;
    case "spotify-this":
        spotify.query(args);
        break;
    case "interactive-mode":
        Q.askCommand();
        break;
    case "help":
        console.log("Available commands:\n"+
            "  <movie-this title> to receive information about a movie.\n"+
            "  <concert-this artist> to receive upcoming concerts from the artist.\n"+
            "  <spotify-this song> to receive a song's artist and spotify information.\n"+
            "  <interactive-mode> to initialize guided LIRI mode.\n");
        break;
    default:
        console.log("Invalid command.\nType <help> for list of commands.");
}