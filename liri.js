//Retrieves API keys from hidden .env called in keys.js and assigns to keys variable
require("dotenv").config();
var keys = require("./keys.js");

//Initialize packages
var fs = require("fs");
var axios = require("axios");
var moment = require('moment');
var inquirer = require("inquirer");
var Spotify = require('node-spotify-api');

//Receives command from 3rd argument and any other argument is taken as a string for calling APIs
var command = process.argv[2];
var args = process.argv.slice(3).join("+");

//Object that contains OMDB API functionality
var OMDB = {
    //Query URL for OMDB with secret key
    queryUrl:`http://www.omdbapi.com/?apikey=${keys.OMDB.key}&y=&plot=short&t=`,

    //Function to query and display in console a specific movie
    query:function (movie){
        //If no movie argument is given, it defaults to "Inside Out"
        movie===""?movie="Inside+Out":"";
        //Queries the server
        axios.get(this.queryUrl+movie).then(
            function(response) {
                if(response.data.Response === "True"){
                    console.log(`${response.data.Title} came out in ${response.data.Year}.`);
                    console.log(`IMDB gave it a score of ${response.data.imdbRating} while Rotten Tomatoes gave it a ${response.data.Ratings[1].Value}.`);
                    console.log(`The movie was produced in ${response.data.Country} and had the language(s) ${response.data.Language}.`);
                    console.log(`The plot of the movie is: "${response.data.Plot}"`);
                    console.log(`Its main actors are ${response.data.Actors}.`);
                }
                //If there's a query error
                else console.log(response.data.Error);
            })
            //If there's a server error
            .catch(function(error) {
              console.log(error);
            });
    },
}

//Object that contains Bands in Town API functionality
var BIT = {
    //Query URL for Bands in Town, separated in two string so that the search paramenter can be insterted in between
    queryUrl:[`https://rest.bandsintown.com/artists/`,`/events?app_id=${keys.BIT.id}`],

    //Funtion to query Bands in Town with given artist and display in console the response
    query:function (band){
        //If no band argument is given, it defaults to "MGMT"
        band===""?band="MGMT":"";

        //Queries Bands in Town
        axios.get(this.queryUrl[0]+band+this.queryUrl[1]).then(
            function(response) {
                if(typeof response.data==="object"){
                    if(response.data.length===0){
                        //If band is found but no concerts appear in the API response
                        console.log(`The band ${band} has no upcoming concerts.`);
                    }else{
                        console.log(`Upcoming concerts for ${band}:\n`);
                        //Displays every venue given by API
                        for(event of response.data){
                            console.log(`Venue: ${event.venue.name} in ${event.venue.city}, ${event.venue.country}`);
                            console.log(moment(event.datetime).format("MM/DD/YYYY"));
                            console.log();
                        }
                    }
                }else{
                    //If band was not found or recognized by API
                    console.log("Band not found!");
                }
            })
            .catch(function(error) {
              console.log(error);
            });
    },
}

//Object that contains Spotify API functionality
var SAPI = {
    //Initialization of API object with API keys
    spotify:new Spotify({
        id: keys.spotify.id,
        secret:keys.spotify.secret
    }),

    //Function to query server and display answer in console
    query:function(song){
        //If no song argument is given, it defaults to "On Melancholy Hill" by Gorillaz
        song===""?song="on+melancholy+hill":"";

        //Queries API with song given and returns only 1 song info
        SAPI.spotify.search({ type: 'track', query:song, limit:1}, function(err, data) {
            if (err) {
              return console.log('Error occurred: ' + err);
            }

            if(data.tracks.items[0]){
                var artists = "";
                var artistsArr = data.tracks.items[0].artists;

                //Parses the response so that between them is a comma and before the last one is an "and"
                for(let i = 0 ; i < artistsArr.length ; i++){
                    i===0?artists=artistsArr[i].name:i===artistsArr.length-1?artists+=" and "+artistsArr[i].name:artists+=", "+artistsArr[i].name;
                }

                console.log(`Artist${artistsArr.length===1?"":"s"}: ${artists}`);
                console.log(`Song: ${data.tracks.items[0].name}`);
                console.log(`Preview link: ${data.tracks.items[0].preview_url?data.tracks.items[0].preview_url:"None"}`);
                console.log(`Album: ${data.tracks.items[0].album.name}`);
            } else {
                //If song is not recognized or found by API
                console.log("Song not found!");
            }
        })
    }
}

//Object that contains Inquirer package funtionality
var Q = {
    //Available commands
    commands:["movie-this","concert-this","spotify-this","random","log","exit"],

    //Asks which command from list
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
            //If user selects exit it displays a message and exits; if random or log is selected, LIRI is called directly;
            //if another choice is selected, interactive mode calls askArg function to request additional arguments
            if(response.choice==="exit")console.log("Thank you for using interactive mode...")
            else if(response.choice==="random"||response.choice==="log")LIRI(response.choice);
            else Q.askArg(response.choice);
        });
    },
    
    //Asks the arguments of the previous asked command
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
            //Calls LIRI with the command from previous inquierer call and the argument response given in this call
            LIRI(command, response.args);
        });
    }
}

//Object that containg logging functioanlity using fs package
var logger = {
    //Logs command and arguments into log.txt, adding LIRI before them
    append:function(log){
        fs.appendFile("log.txt","LIRI "+log, function(err) {
            if (err) console.log(err);
        });
    },

    //Displays in console every command logged in the file
    read:function(){
        fs.readFile("log.txt", "utf8", function(err, data) {
            if (err) {
                console.log(err);
            } else{
                dataArr = data.split(",");
                for(let log of dataArr) console.log(log);
            }
        });
    }
}

//Function to read random.txt and call a random command and argument
function randomCall(){
    fs.readFile("random.txt", "utf8", function(err, data) {
        if (err) {
            console.log(err);
        } else{
            dataArr = data.split(",");
            var random = randomNumber(dataArr.length-1);
            //console.log(dataArr.length,random,dataArr[random].split(" ")[0],dataArr[random].split(" ")[1]);
            LIRI(dataArr[random].split(" ")[0],dataArr[random].split(" ")[1]);
        }
    });
}

//Functions that returns a random number between max and min, including both
function randomNumber (max=10, min=1){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Function that receives command from terminal and sends arguments to its respective object
function LIRI(command, args){
    //Calls logger methos append to log the command and arguments given
    logger.append(`${command}${args===""||args==undefined?"":" "+args}, `);

    //Receives command and sends arguments to respective object
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
        case "random":
            randomCall();
            break;
        case "help":
            console.log("Available commands:\n"+
                "  <movie-this title> to receive information about a movie.\n"+
                "  <concert-this artist> to receive upcoming concerts from the artist.\n"+
                "  <spotify-this song> to receive a song's artist and spotify information.\n"+
                "  <interactive-mode> to initialize LIRI's guided mode.\n");
            break;
        case "log":
            logger.read();
            break;
        default:
            console.log("Invalid command.\nType <help> for list of commands.");
    }
}

LIRI(command,args);