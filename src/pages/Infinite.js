import React, { useState, useEffect } from "react";
import axios from "axios";

import { MainButton, AlbumSelect, MainTable, WinLossToast } from "../components/miniComponents"
import { instance } from "../helpers/axiosInstance";

import "../styles/page.css";
import {
  useToast,
  VStack,
  Text,
} from "@chakra-ui/react";

const correctColor = "var(--correct)";
const incorrectColor = "var(--incorrect)";
const partialColor = "var(--partial)";

const InfiniteGame = () => {
  // A random integer is chosen, the backend will choose a random album from the database as the answer using this integer.
  const [chosenAlbumID, setChosenAlbumID] = useState(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));

  const [username, setUsername] = useState("");
  const [Albums, setAlbums] = useState([]);
  const [guess, setGuess] = useState();
  const [numGuesses, setNumGuesses] = useState(0);
  const [prevGuesses, setPrevGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [albumInfo, setAlbumInfo] = useState();
  const [settings, setSettings] = useState();
  const [colors, setColors] = useState();

  const toast = useToast();

  useEffect(() => {
    toast.closeAll();

    // check if user is logged in. (if so, get and store username & settings)
    instance.get("http://localhost:5000/auth/profile").then((response) => {
      setSettings(response.data.settings);
      setUsername(response.data.username);
    }).catch(function(error) {
      setColors([correctColor, partialColor, incorrectColor]);
      if(error.response)
        console.log(error.response.data);
      else
        console.log({ error: "Cannot authenticate user." });
    });
    
    setAlbums([]);
    // get all of the albums from the database to be shown in our Select component later.
    axios.get('http://localhost:5000/albums/all').then((response) => {
      response.data.map((album) => {
        var artists = '';
        album.artists.forEach((artist, index) => {
          artists += `${artist}${(index !== album.artists.length - 1) ? ', ' : ''}`
        });
        setAlbums((Albums) => [...Albums, {
          value: album.albumID,
          label: `${album.albumName} - ${artists}`
        }])
      })
    })
  }, [])

  // update colors depending on settings colorblind mode state
  useEffect(() => {
    if(settings !== undefined) {
      if(settings.colorblindMode) {
        setColors(["var(--colorblind-correct)", "var(--colorblind-partial)", "var(--colorblind-incorrect)"])
      } else {
        setColors([correctColor, partialColor, incorrectColor])
      }
    }
  }, [settings])

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
    if (numGuesses > 0 && !gameOver) {
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
              album: compareRes.data.correct,
              artist: compareRes.data.correctArtists,
              releaseYear: compareRes.data.correctReleaseYear,
              releaseYearDirection: compareRes.data.releaseYearDirection
            }
            // add the guess to the prevGuesses state
            setPrevGuesses(prevGuesses => [...prevGuesses, {
              albumID: guessID,
              albumName: response.data.album.albumName,
              albumArt: response.data.album.albumArt,
              artists: response.data.album.artists,
              releaseYear: parseInt(response.data.album.releaseYear),
              guessCorrectness : guessCorrectness
            }]);
          })
        })
      }
      // if guess is underfined (if user pressed the SKIP button)...
      else {
        // add an empty guess to the prevGuesses state
        setPrevGuesses(prevGuesses => [...prevGuesses, {
          guessCorrectness: {
            album: false,
            artist: false,
            releaseYear: false,
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
      // if the last guess was correct... the player won.
      if (prevGuesses[prevGuesses.length - 1].guessCorrectness.album) {
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
    if (gameOver) {

      // async function to save game data.
      const saveGame = async () => {

        // get the spotify ID of the answer album.
        var albumID;
        await axios.get(`http://localhost:5000/albums?id=${chosenAlbumID}`).then((response) => {
          albumID = response.data.album.albumID;
          setAlbumInfo(response.data.album)
        })

        let d = new Date(); // save todays Date.
        // this data object will be passed to the POST request to save the game data into the DB.
        let data = {
          username: username,
          mode: "infinite",
          date: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
          albumID: albumID,
          win: win,
          numGuesses: numGuesses,
          guesses: prevGuesses
        }

        // add the game data to the games table in the DB.
        instance.post("http://localhost:5000/games", data).then((response) => {
          if(response.data.success)
            console.log("Game data saved into VINYLE_DB.")
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

      // call the saveGame function.
      saveGame().catch((err) => {
        console.log(err);
      })

      setNumGuesses(6);
    }
  }, [gameOver])

  const restartGame = () => {
    setChosenAlbumID(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
    setGuess();
    setNumGuesses(0);
    setPrevGuesses([]);
    setGameOver(false);
    setWin(false);
    setAlbumInfo();
    toast.closeAll();
  }

  return (
    <div className="page">
      <div className="title">
        INFINITE
      </div>
      <div className="subtitle">
        GUESS THE ALBUM FROM ITS ART
      </div>
      <div className="albumArt" >
        <img src={`http://localhost:5000/albums/art?id=${chosenAlbumID}&guessNum=${numGuesses}`} />
      </div>
      {(gameOver && albumInfo) && <VStack spacing="0" fontSize="20" mt="10px">
        <Text fontWeight="bold">
          {albumInfo.albumName}
        </Text>
        <Text>
          {albumInfo.artists.map((artist, index) => 
            `${artist}${(index !== albumInfo.artists.length - 1) ? `, ` : ``}`
          )}
        </Text>
        <Text>
          {albumInfo.releaseYear}
        </Text>
        </VStack>
      }
      {!(gameOver && albumInfo) && 
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
      }
      <br />
      {/* Guess Table */}
      {(prevGuesses[0] !== undefined && colors !== undefined && chosenAlbumID) && 
        <MainTable
          columnHeaders={["Guess #", "Album", "Artist(s)", "Release Year"]}
          correctGuessColor={colors[0]}
          partialGuessColor={colors[1]}
          incorrectGuessColor={colors[2]}
          body={prevGuesses}
          includeFooter={false}
        />
      }
      {/* WIN/LOSS TOAST NOTIFICATIONS */}
      <WinLossToast
        toast={toast}
        showToast={gameOver}
        win={win}
        numGuesses={numGuesses}
      />
      {/* NEW GAME Button */}
      {
        (gameOver) &&
          <MainButton
            text={'NEW GAME'}
            onClick={() => {restartGame()}}
            m='0px 0px 50px 0px'
            w="fit-content"
          />
      }
    </div>
  );
}

export default InfiniteGame;