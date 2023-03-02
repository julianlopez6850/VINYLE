import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";

import { MainButton, AlbumSelect, MainTableHeader, MainGuessRow, WinLossToast, ShareInfinite } from "../components/miniComponents"
import { instance } from "../helpers/axiosInstance";
import { profileContext } from '../helpers/profileContext';

import "../styles/page.css";
import {
  useToast,
  VStack,
  Text,
  Box,
} from "@chakra-ui/react";
import { ArrowDownIcon, ArrowUpIcon, CloseIcon } from "@chakra-ui/icons";

const correctColor = "var(--correct)";
const incorrectColor = "var(--incorrect)";
const partialColor = "var(--partial)";

const InfiniteGame = () => {

  const location = useLocation();
  
  // A random integer is chosen, the backend will choose a random album from the database as the answer using this integer.
  const [chosenAlbumID, setChosenAlbumID] = useState((location.pathname.includes("/shared")) ? location.pathname.slice(8) : Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));

  const { profile, setProfile } = useContext(profileContext);
  const [Albums, setAlbums] = useState([]);
  const [guess, setGuess] = useState();
  const [numGuesses, setNumGuesses] = useState(0);
  const [prevGuesses, setPrevGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [albumInfo, setAlbumInfo] = useState();
  const [rotation, setRotation] = useState();
  const [colors, setColors] = useState();
  const [showToast, setShowToast] = useState(false);

  const toast = useToast();

  // this event listener will stop an enter press from re-firing a previously clicked button.
  window.addEventListener('keydown', function (e) {
    if ((e.keyIdentifier === 'U+000A' || e.keyIdentifier === 'Enter' || e.keyCode === 13) && e.target.nodeName !== 'BODY') {
      e.preventDefault();
      return false;
    }
  }, true);

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

      setShowToast(true);

      // async function to save game data.
      const saveGame = async () => {

        // get the spotify ID of the answer album.
        var albumID;
        await instance.get(`${process.env.REACT_APP_API_URL}/albums?id=${chosenAlbumID}`).then((response) => {
          albumID = response.data.album.albumID;
          setAlbumInfo(response.data.album)
        })

        let d = new Date(); // save todays Date.
        // this data object will be passed to the POST request to save the game data into the DB.
        let data = {
          username: profile.username,
          mode: "infinite",
          date: `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`,
          albumID: albumID,
          win: win,
          numGuesses: numGuesses,
          guesses: prevGuesses
        }

        // add the game data to the games table in the DB.
        instance.post(`${process.env.REACT_APP_API_URL}/games`, data).then(() => {
          console.log("Game data saved into VINYLE_DB.")
        }).catch(function(error) {
          console.log("Game data failed to save. Error:");
          console.log(error.response.data);
        });
      }

      // call the saveGame function.
      saveGame().catch((err) => {
        console.log(err);
      })
    }
  }, [gameOver])

  // this function is called when the user presses the NEW GAME button.
  const restartGame = () => {
    setChosenAlbumID(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
    setGuess();
    setNumGuesses(0);
    setPrevGuesses([]);
    setGameOver(false);
    setWin(false);
    setAlbumInfo();
    profile.settings.difficulty === 2 && setRotation(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) % 2 === 0 ? 'rotate(90deg)' : 'rotate(-90deg)')
    toast.closeAll();
  }

  // this will handle any enter key press to call checkGuess() function.
  useEffect(() => {
    const keyPressed = (e) => {
      if (e.key === "Enter")
        checkGuess();
    };
    document.addEventListener('keydown', keyPressed, true);
    return () => document.removeEventListener('keydown', keyPressed, true);
  });

  return (
    <div className="page">
      <div className="title">
        {location.pathname.includes("/shared") ? "SHARED GAME" : "INFINITE"}
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
        <ShareInfinite
          isOpen={gameOver}
          id={chosenAlbumID}
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
      {/* NEW GAME Button */}
      {(gameOver) &&
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