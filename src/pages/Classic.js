import React, { useState, useEffect } from "react";
import axios from "axios";

import { MainButton, AlbumSelect, MainTable, WinLossToast } from "../Components/miniComponents"
import { instance } from "../Helpers/axiosInstance";

import "../styles/main.css";
import {
  useToast,
} from "@chakra-ui/react";

const correctGuessColor = "var(--correct-guess)";
const incorrectGuessColor = "var(--incorrect-guess)";

const ClassicGame = () => {
  const [chosenAlbumID, setChosenAlbumID] = useState();
	const [username, setUsername] = useState("");
  const [Albums, setAlbums] = useState([]);
  const [guess, setGuess] = useState();
  const [numGuesses, setNumGuesses] = useState(0);
  const [prevGuesses, setPrevGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [MM_DD_YYYY, setMM_DD_YYYY] = useState();
  const [storage, setStorage] = useState(false);

  const toast = useToast();

  useEffect(() => {
    toast.closeAll();

    // check if user is logged in. (if so, get and store username)
    instance.get("http://localhost:5000/auth/profile").then((response) => {
			setUsername(response.data.username)
		}).catch(function(error) {
      if(error.response)
			  console.log(error.response.data);
      else
        console.log({ error: "Cannot authenticate user." });
		});

    setAlbums([]);
    // get all of the albums from the database to be shown in our Select component later.
    axios.get('http://localhost:5000/albums/all').then((response) => {
      response.data.map((album) => {
        setAlbums((Albums) => [...Albums, { value: album.albumID, label: album.albumName}])
      })
    })

    const date = new Date();
    setMM_DD_YYYY(`${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`);
  }, [])

  useEffect(() => {
    if(MM_DD_YYYY === undefined) {
      return;
    }

    if(localStorage.getItem(MM_DD_YYYY)) {
      setStorage(true);
      setNumGuesses(JSON.parse(localStorage.getItem(MM_DD_YYYY)).guesses.length)
      setPrevGuesses(JSON.parse(localStorage.getItem(MM_DD_YYYY)).guesses)
    }

    axios.post('http://localhost:5000/daily', { date: MM_DD_YYYY }).then(() => {
      axios.get(`http://localhost:5000/daily/id?date=${MM_DD_YYYY}`).then((response) => {
        setChosenAlbumID(response.data.albumID);
      })
    }).catch((error) => {
      if(error.response)
			  console.log(error.response.data);
      else
        console.log({ error: "An error occurred fetching today's daily classic game." });
    })
  }, [MM_DD_YYYY])

  // this function is called when the user presses the GUESS button.
  const checkGuess = () => {
    // if the user has selected a guess AND not gameOver... increment numGuesses.
    if (guess && !gameOver) {
      setNumGuesses(numGuesses => numGuesses + 1);
    }
  }

  // this function is called when the user presses the SKIP button.
  const skipGuess = () => {
    // if not gameOver... set guess to null, and increment numGuesses.
    if (!gameOver) {
      setGuess(null);
      setNumGuesses(numGuesses => numGuesses + 1);
    }
  }

  // when the numGuesses state updates...
  useEffect(() => {
    if(storage) {
      setStorage(false);
    } else if (numGuesses > 0 && !gameOver) {
      console.log("GUESS " + numGuesses + ": ");
      console.log(guess);
      console.log("PREVIOUS GUESSES:");
      console.log(prevGuesses);

      // if guess is not undefined (if user made a guess)...
      if (guess) {
        const guessID = guess.value
        // get the info of the album where the album id = guess.value
        axios.get(`http://localhost:5000/albums?id=${guessID}`).then((response) => {
          // compare the guess with the answer album
          axios.get(`http://localhost:5000/albums/compare?id=${chosenAlbumID}&guess_albumID=${guessID}`).then((compareRes) => {
            // store response data into object, to be saved into prevGuesses state
            const guessCorrectness = {
              albumCorrectness: compareRes.data.correct,
              artistCorrectness: compareRes.data.correctArtists,
              genreCorrectness: compareRes.data.correctGenres,
              releaseYearCorrectness: compareRes.data.correctReleaseYear,
              releaseYearDirection: compareRes.data.releaseYearDirection
            }
            // add the guess to the prevGuesses state
            setPrevGuesses(prevGuesses => [...prevGuesses, {
              albumID: guessID,
              albumName: response.data.album.albumName,
              albumArt: response.data.album.albumArt,
              artists: response.data.album.artists,
              releaseYear: parseInt(response.data.album.releaseYear),
              genres: response.data.album.genres,
              guessCorrectness : guessCorrectness
            }]);
          })
        })
      }
      // if guess is underfined (if user pressed the SKIP button)...
      else {
        // add an empty guess to the prevGuesses state
        setPrevGuesses(prevGuesses => [...prevGuesses, {
          albumID: "",
          albumName: "",
          albumArt: "",
          artists: [""],
          releaseYear: "",
          genres: [""],
          guessCorrectness: {
            albumCorrectness: false,
            artistCorrectness: false,
            releaseYearCorrectness: false,
          }
        }]);
      }
    }
    setGuess(null);
  }, [numGuesses])

  // when the prevGuesses state updates...
  useEffect(() => {
    // if prevGuesses is not empty...
    if(prevGuesses[0]) {
      localStorage.setItem(MM_DD_YYYY,  JSON.stringify({guesses: prevGuesses}))
      // if the last guess was correct... the player won.
      if (prevGuesses[prevGuesses.length - 1].guessCorrectness.albumCorrectness) {
        console.log("YOU WON!");
        setWin(true);
        setGameOver(true);
      }
      // if the last guess was not correct, and the user has reached 6 guesses... the player lost.
      else if (numGuesses >= 6) {
        console.log("YOU LOST.");
        setGameOver(true);
      }
    }

  }, [prevGuesses])

  // when the gameOver state updates...
  useEffect(() => {
    // if gameOver...
    if (gameOver && chosenAlbumID) {

      // async function to save game data.
      const saveGame = async () => {

        // get the spotify ID of the answer album.
        var albumID;
        await axios.get(`http://localhost:5000/albums?id=${chosenAlbumID}`).then((response) => {
          albumID = response.data.album.albumID;
        }).catch((error) => {
          if(error.response)
            console.log(error.response.data);
          else
            console.log(error.message);
        })

        let d = new Date(); // save todays Date.
        // this data object will be passed to the POST request to save the game data into the DB.
        let data = {
          username: username,
          mode: "classic",
          date: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
          albumID: albumID,
          win: win,
          numGuesses: numGuesses,
          guesses: prevGuesses
        }

        // if this game has not already been saved to the DB, save it.
        instance.get(`http://localhost:5000/games/user/hasGame?uesrname=${data.username}&mode=${data.mode}&date=${data.date}`).then((response) => {
          if(response.data.value) {
            return;
          } else {
            // add the game data to the games table in the DB.
            instance.post("http://localhost:5000/games", data).then((response) => {
              if(response.data.success)
                console.log("Game data saved into AlbumleDB.")
              else
              {
                console.log("Game data failed to save. Error:");
                if(response.data.error)
                  console.log(response.data.error);
              }
            }).catch(function(error) {
              console.log("Game data failed to save. Error:");
              console.log(error.response.data);
            });
          }
        }).catch((error) => {
          if(error.response)
            console.log(error.response.data);
          else
            console.log(error.message);
        })
      }

      // call the saveGame function.
      saveGame().catch((err) => {
        console.log(err);
      })

      setNumGuesses(6);
    }
  }, [gameOver, chosenAlbumID])

  return (
    <div className="main">
      <div className="title">
        CLASSIC
      </div>
      <div className="subtitle">
        GUESS THE ALBUM FROM ITS ART
      </div>
      <div className="albumArt" >
        <img src={(chosenAlbumID) ? `http://localhost:5000/albums/art?id=${chosenAlbumID}&guessNum=${numGuesses}` : ""} />
      </div>
      <div className="guess">
        <MainButton
          text={'SKIP'}
          onClick={skipGuess}
        />
        <AlbumSelect
          options={Albums}
          value={guess}
          onChange={(selection) => {
            if (!gameOver) setGuess(selection)
          }}
        />
        <MainButton
          text={'GUESS'}
          onClick={checkGuess}
        />
      </div>
      <br />
      {/* Guess Table */}
      <MainTable
        columnHeaders={["Guess #", "Album", "Artist(s)", "Genre(s)", "Release Year"]}
        correctGuessColor={correctGuessColor}
        incorrectGuessColor={incorrectGuessColor}
        body={prevGuesses}
        includeFooter={true}
      />
      {/* WIN/LOSS TOAST NOTIFICATIONS */}
      <WinLossToast
        toast={toast}
        gameOver={gameOver}
        win={win}
        numGuesses={numGuesses}
      />
    </div>
  );
}

export default ClassicGame;