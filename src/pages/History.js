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
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Box,
  VStack,
  Text,
  HStack,
  Image,
  Tooltip
} from "@chakra-ui/react";

const wonColor = "var(--correct-guess)";
const lossedColor = "var(--incorrect-guess)";

const History = () => {
  const [username, setUsername] = useState();
  const [mode, setMode] = useState();
  const [gamesList, setGamesList] = useState([])
  const [openedGame, setOpenedGame] = useState();

  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

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
      instance.get(`http://localhost:5000/games/user?username=${username}${(mode) ? `&mode=${mode}` : ``}`).then((gamesResponse) => {
        gamesResponse.data.games.reverse().map((game) => {
          const date = new Date(game.date);
          setGamesList((gamesList) => 
            [...gamesList, 
              { date:`${date.getMonth() + 1}-${date.getDate()}-${date.getYear() + 1900}`, 
                id: game.id,
                mode: game.mode,
                win: game.win, 
                album: game.album.albumName, 
                albumArt: game.album.albumArt, 
                artists: game.album.artists, 
                genres: game.album.genres, 
                releaseYear: game.album.releaseYear, 
                numGuesses: (game.win) ? game.numGuesses : undefined,
                guesses: game.guesses
              }
            ])
        })
      }).catch((error) => {
        console.log(error);
      })
    }
  }, [username, mode])

  const openGame = (game, index) => {
    console.log("clicked on game " + (index + 1));
    console.log(game);
    setOpenedGame(game);
    onOpen();
  }

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
            onClick={()=>{setMode(); navigate('/history/all')}}
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
          
          {/* Games History Table */}
          <TableContainer width={800} m="50px 0px 50px 0px" boxShadow="0px 0px 10px black">
            <Table variant='unstyled' size='md'>
              {/* For each game... */}
              {gamesList.map((game, index) =>
                // Add a new row to the table, colored green if the game result was win, red if loss.
                <Tbody
                  key={index}
                  bgColor={(game.win) ? wonColor : lossedColor}
                  style={{
                    cursor: "pointer"
                  }}
                  onClick={()=>{openGame(game, index)}}
                  borderTop={(index === 0) ? "" : "1px solid white"}
                >
                  <Tr>
                    <Td display="flex" flexDir="row" pos="relative">
                      {/* Display Album art. */}
                      <Image src={game.albumArt} w="60px" h="60px" mr="20px"/>

                      {/* Display number of guesses, or X if the player lossed that game. */}
                      <Box
                        w="23px" h="23px"
                        borderRadius="23px"
                        border={"2px solid " + `${(game.win) ? wonColor : lossedColor}`}
                        bottom="2" left="70"
                        align="center" justifyContent="center"
                        pos="absolute"
                        bg="var(--background-color)"
                      >
                        <Text lineHeight="1">
                          {(game.win) ? game.numGuesses : "X"}
                        </Text>
                      </Box>

                      {/* Display Album name, artist, and release year. */}
                      <VStack align="left" spacing="0">
                        {[game.album,game.artists,game.releaseYear].map((item, index) => {
                          return <Text key={index} fontWeight={(index === 0) ? "bold" : ""}>
                              {item}
                            </Text>
                        })}
                      </VStack>

                    </Td>
                    <Td>
                      {/* Display Game mode and date. */}
                      <VStack align="center" spacing="0">
                        {[game.mode,game.date].map((item, index) => {
                          return <Text key={index} fontWeight={(index === 0) ? "bold" : ""}>
                              {item.toUpperCase()}
                            </Text>
                        })}
                      </VStack>
                    </Td>
                  </Tr>
                </Tbody>
              )}
            </Table>
          </TableContainer>

          {/* Modal: Open Game Info From History Table */}
          <Modal
            isCentered
            onClose={onClose}
            isOpen={isOpen}
            motionPreset='slideInBottom'
          >
            <ModalOverlay />
            {(openedGame) ? 
              <ModalContent 
                color="white"
                bgColor="gray.700"
              >
                {/* Display game date and mode. */}
                <ModalHeader
                  display="flex"
                  justifyContent="center"
                >
                  {`${openedGame.date} ${openedGame.mode[0].toUpperCase() + openedGame.mode.substring(1)} Game`}
                </ModalHeader>

                <ModalCloseButton />

                <ModalBody
                  display="flex"
                  flexDir="column"
                  justifyContent="center"
                >
                  {/* Display Album art. */}
                  <Image src={openedGame.albumArt} />

                  {/* Display Album name, artist, and release year. */}
                  <VStack 
                    justifyContent="center"
                    spacing="-1"
                    mb="10px"
                  >
                    {[openedGame.album,openedGame.artists,openedGame.releaseYear].map((item, index) => {
                      return <Text key={index} fontWeight={(index === 0) ? "bold" : ""}>
                          {item}
                        </Text>
                    })}
                  </VStack>

                  {/* Display the guesses made by the player. */}
                  <Text align="center" fontWeight="bold">
                    GUESSES:
                  </Text>
                  <HStack>
                    {openedGame.guesses.map((item, index) => {
                      return <Box bg="white" w="60px" h="60px" display="flex" justifyContent="center" key={index}
                        border={"2px solid " + `${(item.guessCorrectness.albumCorrectness) ? wonColor : lossedColor}`}  
                      >
                        <Tooltip
                          hasArrow
                          label={(item.albumArt) ? 
                            <VStack spacing="-1">
                              <Text fontWeight="bold">{item.albumName}</Text>
                              <Text >{item.artists}</Text>
                              <Text >{item.releaseYear}</Text>
                            </VStack>
                            : 'SKIPPED'
                          }
                          display="flex"
                          bg='var(--background-color)'
                        >
                          {(item.albumArt) ?
                            <Image src={item.albumArt} alt='' w="56px" h="56px" border="0px" alignSelf="center" justifyContent="center"/> :
                            <Text color="black" w="60px" p="19px 0px 19px 0px" display="flex" alignSelf="center" justifyContent="center" fontSize="12px">
                              SKIPPED
                            </Text>
                          }
                        </Tooltip>
                      </Box>
                    })}
                  </HStack>
                </ModalBody>
                <ModalFooter>
                  <Button colorScheme='blue' mr={3} onClick={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </ModalContent>
              : ""
            }
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default History;