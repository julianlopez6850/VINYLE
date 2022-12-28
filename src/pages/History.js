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

const wonColor = "var(--correct-guess)";
const lossedColor = "var(--incorrect-guess)";

const Main = (props) => {
  const [username, setUsername] = useState();
  const [mode, setMode] = useState("all");
  const [gamesList, setGamesList] = useState([])

  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    // check if user is logged in. (if so, get and store username)
    instance.get("http://localhost:5000/auth/profile").then((response) => {
			setUsername(response.data.username)
		}).catch(function(error) {
      if(error.response)
			  console.log(error.response.data);
      else
        console.log({ error: "Cannot authenticate user." });
		});
  }, [])

  useEffect(() => {
    if(username != undefined) {

      setGamesList([]);
      (mode === "all") ?
      instance.get(`http://localhost:5000/games/user/all?username=${username}`).then((gamesResponse) => {
        console.log(gamesResponse.data.games)

        gamesResponse.data.games.map((game, index) => {
          axios.get(`http://localhost:5000/albums?id=${game.albumID}`).then((albumResponse) => {
            const date = new Date(game.date);
            const album = albumResponse.data.album;
            setGamesList((gamesList) => 
              [...gamesList, 
                { date:`${date.getMonth() + 1}-${date.getDate() + 1}-${date.getYear() + 1900}`, 
                  id: game.id, 
                  win: game.win, 
                  album: album.albumName, 
                  albumArt: album.albumArt, 
                  artists: album.artists, 
                  genres: album.genres, 
                  releaseYear: album.releaseYear, 
                  numGuesses: (game.win) ? game.numGuesses : undefined,
                }]
            )
          })
        })
      }).catch((error) => {
        console.log(error);
      }) :
      instance.get(`http://localhost:5000/games/user/mode?username=${username}&mode=${mode}`).then((response) => {
        console.log(response);
      }).catch((error) => {
        console.log(error);
      });
    }
  }, [username, mode])

  useEffect(() => {
    console.log(gamesList)
  }, [gamesList])

  return (
    <div className="main">
      <div className="title">
        HISTORY
      </div>
      <div style={{display:"flex", flexDirection:"row", width:"100%", height:"100%"}}>
        <div style={{width:"10%", height:"calc(80vh)", position:"fixed", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", borderRight:"2px solid white" }}>
          <Button
            className="guessBtn"
            color="white"
            bgColor="gray.700"
            border="1px solid black"
            _hover={{
              border:"1px solid gray"
            }}
            _active={{
              bg: "gray.600",
            }}
            onClick={()=>{setMode('all')}}
          >
            ALL
          </Button>
          <Button
            className="guessBtn"
            color="white"
            bgColor="gray.700"
            border="1px solid black"
            _hover={{
              border:"1px solid gray"
            }}
            _active={{
              bg: "gray.600",
            }}
            onClick={()=>{setMode('Classic')}}
          >
            CLASSIC
          </Button>
          <Button
            className="guessBtn"
            color="white"
            bgColor="gray.700"
            border="1px solid black"
            _hover={{
              border:"1px solid gray"
            }}
            _active={{
              bg: "gray.600",
            }}
            onClick={()=>{setMode('Infinite')}}
          >
            INFINITE
          </Button>
        </div>
        <div style={{width:"100%", display:"flex", flexDirection:"column", alignItems:"center", marginTop:"-25px" }}>
          
          {/* Guess Table */}
          <TableContainer width={1200} height={690} overflowY={"auto"} outline={'3px solid white'} borderRadius='10px' m="50px 0px 50px 0px">
                  <Table variant='simple' size='md' >
                    <Thead>
                      <Tr>
                        <Th outline="1px solid white" color='white'>Game #</Th>
                        <Th outline="1px solid white" color='white'>Date</Th>
                        <Th outline="1px solid white" color='white'>Album</Th>
                        <Th outline="1px solid white" color='white'>Artist</Th>
                        <Th outline="1px solid white" color='white'>Genre(s)</Th>
                        <Th outline="1px solid white" color='white' isNumeric>Release Year</Th>
                      </Tr>
                    </Thead>
                    {gamesList.map((item, index) =>
                        <Tbody
                          key={index}
                          bgColor={(item.win) ? wonColor : lossedColor}
                          style={{
                            cursor: "pointer"
                          }}
                          onClick={()=>{console.log("clicked on game " + (index + 1))}} 
                        >
                          <Tr>
                            <Td outline="1px solid white" isNumeric>
                              {index + 1}
                            </Td>
                            <Td outline="1px solid white">
                              {item.date}
                            </Td>
                            <Td outline="1px solid white" style={{ display: "flex", flexDirection:"row", alignItems:"center" }}>
                              <img src={item.albumArt} style={{width:"60px", marginRight:"20px" }} />{item.album}
                            </Td>
                            <Td outline="1px solid white">
                              {item.artists}
                            </Td>
                            <Td outline="1px solid white">
                              {item.genres}
                            </Td>
                            <Td outline="1px solid white" isNumeric>
                              {item.releaseYear}
                            </Td>
                          </Tr>
                        </Tbody>
                    )}
                  </Table>
                </TableContainer>
        </div>
      </div>
    </div>
  );
}

export default Main;