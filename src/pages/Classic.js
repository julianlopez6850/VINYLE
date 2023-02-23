import React, { useState, useEffect, useContext } from "react";

import { MainButton, AlbumSelect, MainTableHeader, MainGuessRow, WinLossToast, ClassicResults } from "../components/miniComponents"
import { instance } from "../helpers/axiosInstance";
import Statistics, { getStats } from "../components/Statistics"
import { profileContext } from '../helpers/profileContext';

import "../styles/page.css";
import {
  useToast,
  useDisclosure,
  VStack,
  Text,
  Box,
} from "@chakra-ui/react";
import { ArrowDownIcon, ArrowUpIcon, CloseIcon } from "@chakra-ui/icons";

const correctColor = "var(--correct)";
const incorrectColor = "var(--incorrect)";
const partialColor = "var(--partial)";

const ClassicGame = () => {
  const { profile, setProfile } = useContext(profileContext);
  const [chosenAlbumID, setChosenAlbumID] = useState();
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
  const [albumInfo, setAlbumInfo] = useState();
  const [rotation, setRotation] = useState();
  const [colors, setColors] = useState();
  const [showToast, setShowToast] = useState(false);
  const [isOpenShareResults, setIsOpenShareResults] = useState(false);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    toast.closeAll();

    setAlbums([]);
    // get all of the albums from the database to be shown in our Select component later.
    instance.get(`${process.env.REACT_APP_API_URL}/albums/all`).then((response) => {
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
    if(profile.settings.colorblindMode) {
      setColors(["var(--colorblind-correct)", "var(--colorblind-partial)", "var(--colorblind-incorrect)"])
    } else {
      setColors([correctColor, partialColor, incorrectColor])
    }
    profile.settings.difficulty === 2 ? 
      setRotation(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) % 2 === 0 ? 'rotate(90deg)' : 'rotate(-90deg)') : 
      setRotation('rotate(0deg)')
  }, [profile])

  // Check if the user has already played the daily Classic game. (Check if the results are stored in settings or localStorage)
  useEffect(() => {
    if(MM_DD_YYYY === undefined) {
      return;
    }

    if(profile.username) {
      instance.get(`${process.env.REACT_APP_API_URL}/games/user/hasGame?username=${profile.username}&mode=classic&date=${MM_DD_YYYY}`).then((response) => {
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
  }, [MM_DD_YYYY, profile.username])

  // If there is no daily Classic game posted for the current day, POST one. Then, GET the Album ID of the daily Classic game.
  useEffect(() => {
    if(MM_DD_YYYY === undefined) {
      return;
    }
    
    instance.post(`${process.env.REACT_APP_API_URL}/daily`).then(() => {
      instance.get(`${process.env.REACT_APP_API_URL}/daily/id`).then((response) => {
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
      // if guess is not undefined (if user made a guess)...
      if (guess) {
        const guessID = guess.value
        // get the info of the album where the album id = guess.value
        instance.get(`${process.env.REACT_APP_API_URL}/albums?id=${guessID}`).then((response) => {
          // compare the guess with the answer album
          instance.get(`${process.env.REACT_APP_API_URL}/albums/compare?id=${chosenAlbumID}&guess_albumID=${guessID}`).then((compareRes) => {
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
        await instance.get(`${process.env.REACT_APP_API_URL}/albums?id=${chosenAlbumID}`).then((response) => {
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
          username: profile.username,
          mode: "classic",
          date: MM_DD_YYYY,
          albumID: albumID,
          win: win,
          numGuesses: numGuesses,
          guesses: prevGuesses
        }

        // if this game has not already been saved to the DB, save it.
        instance.get(`${process.env.REACT_APP_API_URL}/games/user/hasGame?username=${data.username}&mode=${data.mode}&date=${data.date}`).then((response) => {
          setTimeout(() => {
            setIsOpenShareResults(true);
          }, 500);
          if(response.data.value) {
            console.log("The data from this game has already been saved into VINYLE_DB.");
            return;
          } else {
            // add the game data to the games table in the DB.
            instance.post(`${process.env.REACT_APP_API_URL}/games`, data).then(() => {
              if(win)
                console.log("YOU WON!");
              else
                console.log("YOU LOST.");
              console.log("Game data saved into VINYLE_DB.");
              setShowToast(true);
              setTimeout(() => {
                getStats(undefined, !(profile.username === undefined), profile.username, "Classic", setStats, onOpen);
              }, 500);
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
        <img 
          src={(chosenAlbumID) && ((gameOver) ? `${process.env.REACT_APP_API_URL}/albums/art?id=${chosenAlbumID}&guessNum=6` : `${process.env.REACT_APP_API_URL}/albums/art?id=${chosenAlbumID}&guessNum=${numGuesses}`)}
          style={{
            filter: (profile.settings.difficulty > 0 ? 'grayscale(100%) ' : '') + (profile.settings.difficulty === 2 ? 'invert(1)' : ''),
            transform: rotation
          }}
        />
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
        <Box mb="50px">
          <MainTableHeader
            w="1083px"
            mt="30px"
            mb="-10px"
            columnHeaders={[
              {text: "Guess #", width: "60px"}, 
              {text: "Album", width: "500px"}, 
              {text: "Artist(s)", width: "400px"}, 
              {text: "Release Year", width: "120px"}
            ]}
          />
          {prevGuesses.slice(0).reverse().map((guess, index) => 
            <MainGuessRow
              w="1083px"
              h="50px"
              pt="12px"
              pl="25px"
              mBlock="20px"
              borderRadius="10px"
              guessW="60px"
              albumW="500px"
              artistW="400px"
              releaseW="120px"
              key={index}
              columnHeaders={[
                {text: "Guess #", width: "60px"}, 
                {text: "Album", width: "500px"}, 
                {text: "Artist(s)", width: "400px"}, 
                {text: "Release Year", width: "120px"}
              ]}
              albumBGC={guess.guessCorrectness.album ? 
                colors[0] : 
                colors[2]
              }
              artistBGC={guess.guessCorrectness.artist === "correct" ? 
                colors[0] : 
                guess.guessCorrectness.artist === "partial" ? 
                  colors[1] : 
                  colors[2]
              }
              releaseBGC={guess.guessCorrectness.releaseYear === "correct" ? 
                colors[0] : 
                guess.guessCorrectness.releaseYear === "decade" ? 
                  colors[1] : 
                  colors[2]
              }
              guessNum={prevGuesses.length - index}
              album={guess.albumName ? 
                guess.albumName : 
                <CloseIcon/>
              }
              artist={guess.artists ? 
                guess.artists.map((artist, index) => `${artist}${(index !== guess.artists.length - 1) ? `, ` : ``}`) : 
                <CloseIcon/>
              }
              release={guess.releaseYear ? 
                guess.releaseYear : 
                <CloseIcon/>
              }
              releaseDir={guess.guessCorrectness.releaseYearDirection ? 
                guess.guessCorrectness.releaseYearDirection === "earlier" ? 
                  <ArrowDownIcon/> : 
                    <ArrowUpIcon/> : 
                    undefined
              }
            />
          )}
        </Box>
      }
      {/* View & Share Results */}
      {(colors !== undefined) &&
        <ClassicResults
          username={profile.username}
          date={MM_DD_YYYY}
          isOpen={gameOver && isOpenShareResults}
          win={win}
          numGuesses={prevGuesses.length}
          guesses={prevGuesses}
          album={albumInfo}
          colorblindMode={profile.settings.colorblindMode}
          winColor={colors[0]}
          loseColor={colors[2]}
        />
      }
      {/* WIN/LOSS TOAST NOTIFICATIONS */}
      <WinLossToast
        toast={toast}
        showToast={showToast}
        setShowToast={setShowToast}
        win={win}
        numGuesses={numGuesses}
      />
      {/* Statistics Modal: Shown after game is completed */}
      <Statistics
        mode="Classic"
        colorblindMode={profile.settings.colorblindMode}
        stats={stats}
        onClose={onClose}
        isOpen={isOpen}
        numGuesses={guessIndex}
      />
    </div>
  );
}

export default ClassicGame;