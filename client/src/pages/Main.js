import React, { useState, useEffect } from 'react'
import axios from 'axios';

import { Credentials } from '../Credentials';
import Albums from '../Albums';

import Select from 'react-select';
import "../styles/main.css";

import {
  ChakraProvider,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
} from '@chakra-ui/react'

const albumIndex = Math.floor(Math.random() * Albums.length);
const chosenAlbum = Albums[albumIndex];

const Main = (props) => {

  const [token, setToken] = useState("");
  const [album, setAlbum] = useState({ albumID: "", albumName: "", albumArt: "", artists: [], genres: [], releaseYear: "" });
  const [guess, setGuess] = useState("");
  const [numGuesses, setNumGuesses] = useState(0);
  const [prevGuesses, setPrevGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);


  useEffect(() => {

    // get api token
    axios('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(Credentials().ClientID + ':' + Credentials().ClientSecret)
      },
      data: 'grant_type=client_credentials'
    })
      .then(tokenResponse => {
        setToken(tokenResponse.data.access_token);
      })
  }, [])

  useEffect(() => {

    if (token) {
      // upon receiving api token, get the top 10 albums of the chosen artist
      axios(`https://api.spotify.com/v1/albums/${chosenAlbum.value}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
        .then(albumResponse => {
          setAlbum({
            albumID: chosenAlbum.value,
            albumName: albumResponse.data.name,
            albumArt: albumResponse.data.images[1].url,
            artists: albumResponse.data.artists,
            releaseYear: parseInt(albumResponse.data.release_date.slice(0, 4)),
            genres: albumResponse.data.genres
          })
        });
    }

  }, [token])

  const checkGuess = () => {
    if (guess && !gameOver) {
      setNumGuesses(numGuesses => numGuesses + 1);
    }
  }

  const skipGuess = () => {
    if (!gameOver) {
      setGuess("");
      setNumGuesses(numGuesses => numGuesses + 1);
    }
  }

  useEffect(() => {
    if (numGuesses > 0 && !gameOver) {
      console.log("GUESS " + numGuesses + ": ");
      console.log(guess);
      console.log("ACTUAL ALBUM:");
      console.log(album);
      console.log("PREVIOUS GUESSES:");
      console.log(prevGuesses);

      if (guess) {
        axios(`https://api.spotify.com/v1/albums/${guess.value}`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + token
          }
        })
          .then(albumResponse => {
            setPrevGuesses(prevGuesses => [...prevGuesses, {
              albumID: guess.value,
              albumName: albumResponse.data.name,
              albumArt: albumResponse.data.images[1].url,
              artists: albumResponse.data.artists,
              releaseYear: parseInt(albumResponse.data.release_date.slice(0, 4)),
              genres: albumResponse.data.genres,
              guessCorrectness: {
                albumCorrectness: (albumResponse.data.name === album.albumName) ? true : false,
                artistCorrectness: (albumResponse.data.artists[0].name === album.artists[0].name) ? true : false,
                releaseYearCorrectness: (parseInt(albumResponse.data.release_date.slice(0, 4)) === album.releaseYear) ? true : false,
                releaseYearDirection: (parseInt(albumResponse.data.release_date.slice(0, 4)) > album.releaseYear) ? "earlier" : "later"
              }
            }]);
          });
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

      if (guess.value === album.albumID) {
        console.log("YOU WON!");
        setWin(true);
        setGameOver(true);
      }
      else if (numGuesses >= 6) {
        console.log("YOU LOST.");
        setGameOver(true);
      }
    }
  }, [numGuesses])

  useEffect(() => {
    if (gameOver) {
      let d = new Date();

      let data = {
        userID: "1",
        date: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
        albumID: chosenAlbum.value,
        win: win,
        numGuesses: numGuesses,
        guesses: prevGuesses
      }

      console.log(data)

      axios.post("http://localhost:5000/gamesplayed", data).then((response) => {
        console.log("GAME POSTED TO ALBUMLEDB")
      })
    }
  }, [prevGuesses])

  const toast = useToast();

  return (
    <div className="main">
      <div className="title">
        ALBUMLE
      </div>
      <div className="subtitle">
        GUESS THE ALBUM FROM ITS ART
      </div>
      <div className="albumArt" >
        <img src={album.albumArt} id={(gameOver) ? "end" : ("guess" + numGuesses)} />
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
      <ChakraProvider>
        <TableContainer width={1200} outline={'3px solid white'} borderRadius='10px' m="50px 0px 50px 0px">
          <Table variant='simple' size='md' >
            <Thead outline={'1px solid white'} >
              <Tr>
                <Th outline="1px solid white" color='white'>Guess #</Th>
                <Th outline="1px solid white" color='white'>Album</Th>
                <Th outline="1px solid white" color='white'>Artist</Th>
                <Th outline="1px solid white" color='white'>Genre(s)</Th>
                <Th outline="1px solid white" color='white' isNumeric>Release Year</Th>
              </Tr>
            </Thead>
            {prevGuesses.map((item, index) =>
              <Tbody outline={'1px solid white'} >
                <Tr>
                  <Td outline="1px solid white" >
                    {index + 1}
                  </Td>
                  <Td outline="1px solid white" bgColor={(item.guessCorrectness.albumCorrectness) ? "green" : "red"}>
                    {item.albumName}
                  </Td>
                  <Td outline="1px solid white" bgColor={(item.guessCorrectness.artistCorrectness) ? "green" : "red"}>
                    {item.artists.map((item, index, artists) => { return (index + 1 === artists.length) ? item.name : (item.name + ", ") })}
                  </Td>
                  <Td outline="1px solid white" bgColor={(item.guessCorrectness.artistCorrectness) ? "green" : "red"}>
                    {item.genres}
                  </Td>
                  <Td outline="1px solid white" bgColor={(item.guessCorrectness.releaseYearCorrectness) ? "green" : "red"} isNumeric>
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
      </ChakraProvider>
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