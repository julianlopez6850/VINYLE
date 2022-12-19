import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

import { instance } from "../Helpers/axiosInstance";

import "../styles/main.css";
import Select from "react-select";
import {
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  useToast,
  Button
} from "@chakra-ui/react";

// A random integer is chosen, the backend will choose a random album from the database as the answer using this integer.
const chosenAlbumID = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

const correctGuessColor = "var(--correct-guess)";
const incorrectGuessColor = "var(--incorrect-guess)";

const Main = (props) => {
	const [username, setUsername] = useState("");
  const [Albums, setAlbums] = useState([]);
  const [guess, setGuess] = useState();
  const [numGuesses, setNumGuesses] = useState(0);
  const [prevGuesses, setPrevGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [mode, setMode] = useState();

  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    setMode(props.mode);
  }, [location])

  useEffect(() => {
    // check if user is logged in. (if so, get and store username)
    instance.get("http://localhost:5000/auth/profile").then((response) => {
			setUsername(response.data.username)
		}).catch(function(error) {
      if(error.response)
			  console.log(error.response.data);
      else
        console.log({ error: "Error logging in" });
		});

    setAlbums([]);
    // get all of the albums from the database to be shown in our Select component later.
    axios.get('http://localhost:5000/albums/all').then((response) => {
      response.data.map((album) => {
        setAlbums((Albums) => [...Albums, { value: album.albumID, label: album.albumName}])
      })
      return { value: response.data.albumID, label: response.data.albumName}
    })
  }, [])

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
      setGuess();
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
  }, [numGuesses])

  // when the prevGuesses state updates...
  useEffect(() => {
    // if prevGuesses is not empty...
    if(prevGuesses[0]) {
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
    if (gameOver) {

      // async function to save game data.
      const saveGame = async () => {

        // get the spotify ID of the answer album.
        var albumID;
        await axios.get(`http://localhost:5000/albums?id=${chosenAlbumID}`).then((response) => {
          albumID = response.data.album.albumID;
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

      // call the saveGame function.
      saveGame().catch((err) => {
        console.log(err);
      })

      setNumGuesses(6);
    }
  }, [gameOver])

  return (
    <div className="main">
      <div className="title">
        CLASSIC
      </div>
      <div className="subtitle">
        GUESS THE ALBUM FROM ITS ART
      </div>
      <div className="albumArt" >
        <img src={`http://localhost:5000/albums/art?id=${chosenAlbumID}&guessNum=${numGuesses}`} />
      </div>
      <div className="guess">
        <Button
          className="guessBtn"
          color="white"
          bgColor="gray.700"
          borderColor="gray.700"
          _hover={{
            border:"1px solid gray"
          }}
          _active={{
            bg: "gray.600",
          }}
          onClick={skipGuess}
        >
          SKIP
        </Button>
        <Select className="select" options={Albums} onChange={(selection) => { if (!gameOver) setGuess(selection) }} />
        <Button
          className="guessBtn"
          color="white"
          bgColor="gray.700"
          borderColor="gray.700"
          _hover={{
            border:"1px solid gray"
          }}
          _active={{
            bg: "gray.600",
          }}
          onClick={checkGuess}
        >
          GUESS
        </Button>
      </div>
      <br />
      {/* Guess Table */}
      <TableContainer width={1200} outline={'3px solid white'} borderRadius='10px' m="50px 0px 50px 0px">
        <Table variant='simple' size='md' >
          <Thead>
            <Tr>
              <Th outline="1px solid white" color='white'>Guess #</Th>
              <Th outline="1px solid white" color='white'>Album</Th>
              <Th outline="1px solid white" color='white'>Artist</Th>
              <Th outline="1px solid white" color='white'>Genre(s)</Th>
              <Th outline="1px solid white" color='white' isNumeric>Release Year</Th>
            </Tr>
          </Thead>
          {prevGuesses.map((item, index) =>
            <Tbody key={index}>
              <Tr>
                <Td outline="1px solid white" >
                  {index + 1}
                </Td>
                <Td outline="1px solid white" bgColor={(item.guessCorrectness.albumCorrectness) ? correctGuessColor : incorrectGuessColor}>
                  {item.albumName}
                </Td>
                <Td outline="1px solid white" bgColor={(item.guessCorrectness.artistCorrectness) ? correctGuessColor : incorrectGuessColor}>
                  {item.artists}
                </Td>
                <Td outline="1px solid white" bgColor={(item.guessCorrectness.genreCorrectness) ? correctGuessColor : incorrectGuessColor}>
                  {item.genres}
                </Td>
                <Td outline="1px solid white" bgColor={(item.guessCorrectness.releaseYearCorrectness) ? correctGuessColor : incorrectGuessColor} isNumeric>
                  {(item.guessCorrectness.releaseYearCorrectness) ? "" : (item.releaseYear) ? ((item.guessCorrectness.releaseYearDirection === "later") ? "^" : "V") : ""}{item.releaseYear}
                </Td>
              </Tr>
            </Tbody>
          )}
          <Tfoot>
            <Tr>
              <Th outline="1px solid white" color='white'>Guess #</Th>
              <Th outline="1px solid white" color='white'>Album</Th>
              <Th outline="1px solid white" color='white'>Artist</Th>
              <Th outline="1px solid white" color='white'>Genre(s)</Th>
              <Th outline="1px solid white" color='white' isNumeric>Release Year</Th>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
      {/* WIN/LOSS TOAST NOTIFICATIONS */}
      {
        (gameOver) ?
          (win) ?
            (!toast.isActive(' ')) ?
              toast({
                position: 'top',
                id: ' ',
                title: 'VICTORY',
                description: `You guessed the correct album in ${numGuesses} ${(numGuesses === 1) ? "try" : "tries"}!`,
                status: 'success',
                duration: 5000,
                isClosable: false
              }) : "" :
            (!toast.isActive('')) ?
              toast({
                position: 'top',
                id: '',
                title: 'DEFEAT',
                description: 'You failed to guess the correct album',
                status: 'error',
                duration: 5000,
                isClosable: false
              }) : "" :
          ""
      }
    </div>
  );
}

export default Main;