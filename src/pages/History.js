import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { MainButton } from "../Components/miniComponents"
import { instance } from "../Helpers/axiosInstance";

import "../styles/main.css";
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

const History = () => {
  const [username, setUsername] = useState();
  const [mode, setMode] = useState("all");
  const [gamesList, setGamesList] = useState([])

  const location = useLocation();
  const navigate = useNavigate();
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
      instance.get(`http://localhost:5000/games/user?username=${username}${(mode === 'all') ? '' : `&mode=${mode}`}`).then((gamesResponse) => {
        gamesResponse.data.games.map((game) => {
          const date = new Date(game.date);
          setGamesList((gamesList) => 
            [...gamesList, 
              { date:`${date.getMonth() + 1}-${date.getDate() + 1}-${date.getYear() + 1900}`, 
                id: game.id, 
                win: game.win, 
                album: game.album.albumName, 
                albumArt: game.album.albumArt, 
                artists: game.album.artists, 
                genres: game.album.genres, 
                releaseYear: game.album.releaseYear, 
                numGuesses: (game.win) ? game.numGuesses : undefined,
              }
            ])
        })
      }).catch((error) => {
        console.log(error);
      })
    }
  }, [username, mode])

  return (
    <div className="main">
      <div className="title">
        HISTORY
      </div>
      <div style={{display:"flex", flexDirection:"row", width:"100%", height:"100%"}}>
        <div style={{width:"10%", height:"calc(80vh)", position:"fixed", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", borderRight:"2px solid white" }}>
          <strong>
            MODES
          </strong>
          <MainButton
            text={'ALL'}
            onClick={()=>{setMode('all'); navigate('/history/all')}}
            m="10px 0 10px 0"
          />
          <MainButton
            text={'CLASSIC'}
            onClick={()=>{setMode('Classic'); navigate('/history/classic')}}
            m="10px 0 10px 0"
          />
          <MainButton
            text={'INFINITE'}
            onClick={()=>{setMode('Infinite'); navigate('/history/infinite')}}
            m="10px 0 10px 0"
          />
        </div>
        <div style={{width:"100%", display:"flex", flexDirection:"column", alignItems:"center", marginTop:"-25px" }}>
          
          {/* Guess Table */}
          <TableContainer width={1200} maxH={690} overflowY={"auto"} outline={'3px solid white'} borderRadius='10px' m="50px 0px 50px 0px">
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

export default History;