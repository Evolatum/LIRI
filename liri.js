require("dotenv").config();
var keys = require("./keys.js");
var axios = require("axios");
var moment = require('moment');
var inquirer = require("inquirer");
var Spotify = require('node-spotify-api');

var command = process.argv[2];
var args = process.argv.slice(3).join("+");


var OMDB = {
    queryUrl:`http://www.omdbapi.com/?apikey=${keys.OMDB.key}&y=&plot=short&t=`,

    query:function (movie){
        movie===""?movie="Inside+Out":"";
        axios.get(this.queryUrl+movie).then(
            function(response) {
                if(response.data.Response === "True"){
                    console.log(`${response.data.Title} came out in ${response.data.Year}.`);
                    console.log(`IMDB gave it a score of ${response.data.imdbRating} while Rotten Tomatoes gave it a ${response.data.Ratings[1].Value}.`);
                    console.log(`The movie was produced in ${response.data.Country} and had the language(s) ${response.data.Language}.`);
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
        band===""?band="MGMT":"";
        axios.get(this.queryUrl[0]+band+this.queryUrl[1]).then(
            function(response) {
                if(typeof response.data==="object"){
                    if(response.data.length===0){
                        console.log(`The band ${band} has no upcoming concerts.`);
                    }else{
                        for(event of response.data){
                            console.log(`Venue: ${event.venue.name} in ${event.venue.city}, ${event.venue.country}`);
                            console.log(moment(event.datetime).format("MM/DD/YYYY"));
                            console.log();
                        }
                    }
                }else{
                    console.log("Band not found!");
                }
            })
            .catch(function(error) {
              console.log(error);
            });
    },
}

var SAPI = {
    spotify:new Spotify({
        id: keys.spotify.id,
        secret:keys.spotify.secret
    }),

    query:function(song){
        song===""?song="on+melancholy+hill":"";
        SAPI.spotify.search({ type: 'track', query:song, limit:1}, function(err, data) {
            if (err) {
              return console.log('Error occurred: ' + err);
            }

            if(data.tracks.items[0]){
                var artists = "";
                var artistsArr = data.tracks.items[0].artists;

                for(let i = 0 ; i < artistsArr.length ; i++){
                    i===0?artists=artistsArr[i].name:i===artistsArr.length-1?artists+=" and "+artistsArr[i].name:artists+=", "+artistsArr[i].name;
                }

                
                
                console.log(`Artist${artistsArr.length===1?"":"s"}: ${artists}`);
                console.log(`Song: ${data.tracks.items[0].name}`);
                console.log(`Preview link: ${data.tracks.items[0].preview_url?data.tracks.items[0].preview_url:"None"}`);
                console.log(`Album: ${data.tracks.items[0].album.name}`);
            } else {
                console.log("Song not found!");
            }
        })
    }
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
        SAPI.query(args);
        break;
    case "interactive-mode":
        Q.askCommand();
        break;
    case "help":
        console.log("Available commands:\n"+
            "  <movie-this title> to receive information about a movie.\n"+
            "  <concert-this artist> to receive upcoming concerts from the artist.\n"+
            "  <spotify-this song> to receive a song's artist and spotify information.\n"+
            "  <interactive-mode> to initialize LIRI's guided mode.\n");
        break;
    default:
        console.log("Invalid command.\nType <help> for list of commands.");
}