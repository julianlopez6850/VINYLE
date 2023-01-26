import React, { useState, useEffect } from "react";
import axios from "axios";

import { MainButton, AlbumSelect, MainTable, WinLossToast } from "../components/miniComponents"
import { instance } from "../helpers/axiosInstance";
import Statistics, { getStats } from "../components/Statistics"

import "../styles/page.css";
import {
  useToast,
  useDisclosure,
  VStack,
  Text,
} from "@chakra-ui/react";

const correctColor = "var(--correct)";
const incorrectColor = "var(--incorrect)";
const partialColor = "var(--partial)";

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
  const [stats, setStats] = useState({});
  const [guessIndex, setGuessIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [albumInfo, setAlbumInfo] = useState();
  const [settings, setSettings] = useState();
  const [colors, setColors] = useState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

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

    const date = new Date();
    setMM_DD_YYYY(`${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`);
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

  useEffect(() => {
    if(MM_DD_YYYY === undefined) {
      return;
    }

    if(username) {
      instance.get(`http://localhost:5000/games/user/hasGame?username=${username}&mode=classic&date=${MM_DD_YYYY}`).then((response) => {
        if(response.data.value) {
          setStorage(true);
          setNumGuesses(response.data.games[0].numGuesses)
          setPrevGuesses(response.data.games[0].guesses)
        } else if(localStorage.getItem(MM_DD_YYYY)) {
          setStorage(true);
          setNumGuesses(JSON.parse(localStorage.getItem(MM_DD_YYYY)).guesses.length)
          setPrevGuesses(JSON.parse(localStorage.getItem(MM_DD_YYYY)).guesses)
        }
      }).catch((error) => {
        if(error.response)
          console.log(error.response.data);
        else
          console.log(error.message);
      })
    } else if(localStorage.getItem(MM_DD_YYYY)) {
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
  }, [MM_DD_YYYY, username])

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
    if(prevGuesses[0] && !gameOver) {
      localStorage.setItem(MM_DD_YYYY,  JSON.stringify({guesses: prevGuesses}))
      // if the last guess was correct... the player won.
      if (prevGuesses[prevGuesses.length - 1].guessCorrectness.album) {
        setGuessIndex(numGuesses - 1);
        setWin(true);
        setGameOver(true);
      }
      // if the last guess was not correct, and the user has reached 6 guesses... the player lost.
      else if (numGuesses >= 6) {
        setGuessIndex(6);
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
          setAlbumInfo(response.data.album)
        }).catch((error) => {
          if(error.response)
            console.log(error.response.data);
          else
            console.log(error.message);
        })

        // this data object will be passed to the POST request to save the game data into the DB.
        let data = {
          username: username,
          mode: "classic",
          date: MM_DD_YYYY,
          albumID: albumID,
          win: win,
          numGuesses: numGuesses,
          guesses: prevGuesses
        }

        // if this game has not already been saved to the DB, save it.
        instance.get(`http://localhost:5000/games/user/hasGame?username=${data.username}&mode=${data.mode}&date=${data.date}`).then((response) => {
          if(response.data.value) {
            console.log("The data from this game has already been saved into VINYLE_DB.");
            return;
          } else {
            // add the game data to the games table in the DB.
            instance.post("http://localhost:5000/games", data).then((response) => {
              if(response.data.success) {
                if(win)
                  console.log("YOU WON!");
                else
                  console.log("YOU LOST.");
                console.log("Game data saved into VINYLE_DB.");
                setShowToast(true);
                setTimeout(() => {
                  getStats(undefined, !(username === undefined), username, "Classic", setStats, onOpen);
                }, 1500);
              }
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
    <div className="page">
      <div className="title">
        CLASSIC
      </div>
      <div className="subtitle">
        GUESS THE ALBUM FROM ITS ART
      </div>
      <div className="albumArt" >
        <img src={(chosenAlbumID) && `http://localhost:5000/albums/art?id=${chosenAlbumID}&guessNum=${numGuesses}`} />
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
      {(!gameOver && !albumInfo && chosenAlbumID) && 
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
        showToast={showToast}
        win={win}
        numGuesses={numGuesses}
      />
      {/* Statistics Modal: Shown after game is completed */}
      <Statistics
        mode="Classic"
        stats={stats}
        onClose={onClose}
        isOpen={isOpen}
        numGuesses={guessIndex}
      />
    </div>
  );
}

export default ClassicGame;