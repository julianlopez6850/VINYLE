import React, { useState, useEffect } from 'react'
import axios from 'axios';
import Select from 'react-select';
import './App.css';

import { Credentials } from './Credentials';
import Artists from './Artists';
import Main from './pages/Main';

const artistIndex = Math.floor(Math.random() * Artists.length);
const chosenArtist = Artists[artistIndex];

const App = () => {

  const [token, setToken] = useState("");
  const [albums, setAlbums] = useState({ selectedAlbum: "", listOfAlbums: []});
  const [track, setTrack] = useState({ selectedTrack: "", listOfTracks: []})
  const [trackImg, setTrackImg] = useState("");
  const [guess, setGuess] = useState("");
  const [numGuesses, setNumGuesses] = useState(0);
  const [prevGuesses, setPrevGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect (() => {

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

      axios(`https://api.spotify.com/v1/artists/${chosenArtist.value}/albums?limit=10`, {
        method: 'GET',
        headers: {
          'Authorization' : 'Bearer ' + tokenResponse.data.access_token
        }
      })
      .then(albumResponse => {
        setAlbums({
          selectedAlbum: albumResponse.data.items[Math.floor(Math.random() * albumResponse.data.items.length)],
          listOfAlbums: albumResponse.data.items
        })
      });
    })
  }, [])

  // 5zi7WsKlIiUXv09tbGLKsE

  // By artist: https://api.spotify.com/v1/search?type=track&q=artist:Michael Jackson

  // By playlist: https://api.spotify.com/v1/playlists/3RFP1W7BAxOr6wfpoEusO7/tracks

  useEffect(() => {
    if(albums.selectedAlbum !== "")
    {
      axios(`https://api.spotify.com/v1/albums/${albums.selectedAlbum.id}/tracks`, {
          method: 'GET',
          headers: {
            'Authorization' : 'Bearer ' + token
          }
        })
        .then(trackResponse => {
          setTrack({
            selectedTrack: trackResponse.data.items[Math.floor(Math.random() * trackResponse.data.items.length)],
            listOfTracks: trackResponse.data.items
          })
        });
    }
  }, [albums])

  useEffect(() => {
    if(track.selectedTrack !== "")
    {
      axios(`https://api.spotify.com/v1/tracks/${track.selectedTrack.id}`, {
          method: 'GET',
          headers: {
            'Authorization' : 'Bearer ' + token
          }
        })
        .then(trackResponse => {
          console.log(trackResponse.data.album.name)
          setTrackImg(trackResponse.data.album.images[1].url)
        });
    }
  }, [track])

  const checkGuess = () => {
    setNumGuesses(numGuesses => numGuesses + 1);
  }

  useEffect(() => {
    if(numGuesses > 0 && !gameOver)
    {
      console.log(guess.label);
      console.log(chosenArtist.label);
      console.log(numGuesses);

      if(guess.label === chosenArtist.label)
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
      <Main />
      <div className="albumArt" >
        <img src={trackImg}  id={(gameOver) ? "end" : ("guess" + numGuesses)} />
      </div>
      <div className="guess">
        <Select options={Artists} onChange={(selection) => {setGuess(selection)}} />
        <button onClick={checkGuess}>
          GUESS
        </button>
      </div>
      <br />
      <div>
        {
          prevGuesses.map((item, index) => <div>Guess {index + 1} : {item.label}</div>)
        }
      </div>
    </div>
  );
}

export default App;
