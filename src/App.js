import React, { useState, useEffect } from 'react'
import axios from 'axios';
import './App.css';

import { Credentials } from './Credentials';
import Main from './pages/Main';
import Albums from './Albums';

const albumIndex = Math.floor(Math.random() * Albums.length);
const chosenAlbum = Albums[albumIndex];

const App = () => {

  const [token, setToken] = useState("");
  const [album, setAlbum] = useState({albumID: "", albumName: "", albumArt: "", artists: [], genres: []});
  const [guess, setGuess] = useState("");
  const [numGuesses, setNumGuesses] = useState(0);
  const [prevGuesses, setPrevGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect (() => {

    // get api token
    axios('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Authorization' : 'Basic ' + btoa(Credentials().ClientID + ':' + Credentials().ClientSecret)
      },
      data: 'grant_type=client_credentials'
    })
    .then(tokenResponse => {
      setToken(tokenResponse.data.access_token);
    })
  }, [])

  useEffect(() => {
    
    if(token)
    {
      // upon receiving api token, get the top 10 albums of the chosen artist
      axios(`https://api.spotify.com/v1/albums/${chosenAlbum.value}`, {
        method: 'GET',
        headers: {
          'Authorization' : 'Bearer ' + token
        }
      })
      .then(albumResponse => {
        setAlbum({
          albumID: chosenAlbum.value,
          albumName: albumResponse.data.name,
          albumArt: albumResponse.data.images[1].url,
          artists: albumResponse.data.artists
        })
      });
    }

  }, [token])

  const checkGuess = () => {
    setNumGuesses(numGuesses => numGuesses + 1);
  }

  useEffect(() => {
    if(numGuesses > 0 && !gameOver)
    {
      console.log(guess.value);
      console.log(album.albumID);
      console.log(numGuesses);

      if(guess.value === album.albumID)
      {
        console.log("YOU WON!");
        setGameOver(true);
      }
      else if(numGuesses >= 6)
      {
        console.log("YOU LOST.");
        setGameOver(true);
      }

      setPrevGuesses(prevGuesses => [...prevGuesses, guess]);
  }
  }, [numGuesses])

  useEffect(() => {
    console.log(prevGuesses);
  }, [prevGuesses])

  return (
    <div className="App">
      <Main 
        album={album}
        Albums={Albums}
        gameOver={gameOver}
        numGuesses={numGuesses}
        checkGuess={checkGuess}
        setGuess={setGuess}
        prevGuesses={prevGuesses}
      />
    </div>
  );
}

export default App;
