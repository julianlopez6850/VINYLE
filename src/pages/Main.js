import React, { useState, useEffect } from "react";
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
} from "@chakra-ui/react";

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

  const toast = useToast();

  useEffect(() => {
    // check if user is logged in. (if so, get and store username)
    instance.get("http://localhost:5000/auth/profile").then((response) => {
			console.log(response);
			setUsername(response.data.username)
		}).catch(function(error) {
      if(error.response)
			  console.log(error.response.data);
      else
        console.log({ error: "Error logging in" });
		});

    axios.get('http://localhost:5000/albums/all').then((response) => {
      response.data.map((album) => {
        setAlbums((Albums) => [...Albums, { value: album.albumID, label: album.albumName}])
      })
      return { value: response.data.albumID, label: response.data.albumName}
    })
  }, [])

  const checkGuess = () => {
    if (guess && !gameOver) {
      setNumGuesses(numGuesses => numGuesses + 1);
    }
  }

  const skipGuess = () => {
    if (!gameOver) {
      setGuess();
      setNumGuesses(numGuesses => numGuesses + 1);
    }
  }

  useEffect(() => {
    if (numGuesses > 0 && !gameOver) {
      console.log("GUESS " + numGuesses + ": ");
      console.log(guess);
      console.log("PREVIOUS GUESSES:");
      console.log(prevGuesses);

      if (guess) {
        axios.get(`http://localhost:5000/albums?id=${guess.value}`).then((response) => {
          console.log(response.data.album);
          var guessCorrectness;
          
          var guess = {
            albumID: response.data.album.albumID,
            albumName: response.data.album.albumName,
            albumArt: response.data.album.albumArt,
            artists: response.data.album.artists,
            genres: response.data.album.genres,
            releaseYear: parseInt(response.data.album.releaseYear),
          }

          guess = `guess_albumID=${guess.albumID}&guess_artists=${guess.artists}&guess_genres=${guess.genres}&guess_releaseYear=${guess.releaseYear}`

          axios.get(`http://localhost:5000/albums/compare?id=${chosenAlbumID}&${guess}`).then((compareRes) => {
            console.log(compareRes.data)
            guessCorrectness = {
              albumCorrectness: compareRes.data.correct,
              artistCorrectness: compareRes.data.correctArtist,
              releaseYearCorrectness: compareRes.data.correctReleaseYear,
              releaseYearDirection: compareRes.data.releaseYearDirection
            }
            setPrevGuesses(prevGuesses => [...prevGuesses, {
              albumID: guess.value,
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
      else {
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

  useEffect(() => {
    if(prevGuesses[0]) {
      if (prevGuesses[prevGuesses.length - 1].guessCorrectness.albumCorrectness) {
        console.log("YOU WON!");
        setWin(true);
        setGameOver(true);
      }
      else if (numGuesses >= 6) {
        console.log("YOU LOST.");
        setGameOver(true);
      }
    }

  }, [prevGuesses])

  useEffect(() => {
    if (gameOver) {
      let d = new Date();

      let data = {
        username: username,
        date: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
        albumID: `http://localhost:5000/albums?id=${chosenAlbumID}`,
        win: win,
        numGuesses: numGuesses,
        guesses: prevGuesses
      }

      console.log(data)
      
      instance.post("http://localhost:5000/gamesplayed", data).then((response) => {
        if(response.data.success)
          console.log("Game data saved into AlbumleDB.")
        else
        {
          console.log("Game data failed to save.");
          if(response.data.error)
            console.log("Error: " + response.data.error);
        }
      }).catch(function(error) {
        console.log("Game data failed to save.");
        console.log(error.response.data);
      });
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
        <button className="guessBtn" onClick={skipGuess}>
          SKIP
        </button>
        <Select className="select" options={Albums} onChange={(selection) => { if (!gameOver) setGuess(selection) }} />
        <button className="guessBtn" onClick={checkGuess}>
          GUESS
        </button>
      </div>
      <br />
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
                <Td outline="1px solid white" bgColor={(item.guessCorrectness.artistCorrectness) ? correctGuessColor : incorrectGuessColor}>
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
            (!toast.isActive('win')) ?
              toast({
                position: 'top',
                id: 'win',
                title: 'VICTORY',
                description: `You guessed the correct album in ${numGuesses} ${(numGuesses === 1) ? "try" : "tries"}!`,
                status: 'success',
                duration: 5000,
                isClosable: false
              }) : "" :
            (!toast.isActive('loss')) ?
              toast({
                position: 'top',
                id: 'loss',
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