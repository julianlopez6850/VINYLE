import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { HistoryButton, MainButton } from "../components/miniComponents"
import { instance } from "../helpers/axiosInstance";
import { profileContext } from '../helpers/profileContext';

import "../styles/page.css";
import {
  TableContainer,
  Table,
  Tbody,
  Tr,
  Td,
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
  Tooltip,
  useToast,
  useMediaQuery,
} from "@chakra-ui/react";

import {
  CloseIcon,
} from '@chakra-ui/icons'

const winColor = "var(--correct)";
const lossColor = "var(--incorrect)";

const History = () => {
  const { profile, setProfile } = useContext(profileContext);
  const [mode, setMode] = useState();
  const [gamesList, setGamesList] = useState([])
  const [openedGame, setOpenedGame] = useState();
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [modeChanged, setModeChanged] = useState(false);
  const [colors, setColors] = useState([winColor, lossColor]);
  const [numGames, setNumGames] = useState();

  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // media queries
  const [isSmallerThan900] = useMediaQuery('(max-width: 900px)');
  const [isSmallerThan700] = useMediaQuery('(max-width: 700px)');
  const [isSmallerThan550] = useMediaQuery('(max-width: 550px)');

  // these states will be used to change UI depending on the above media queries 
  const [rowWidth, setRowWidth] = useState("800px");
  const [subtractPadding, setSubtractPadding] = useState(0);
  const [historyFontSize, setHistoryFontSize] = useState("16px");

  useEffect(() => {
    toast.closeAll();
  }, [])

  useEffect(() => {
    if(isSmallerThan550) {
      setRowWidth("350px");
      setHistoryFontSize("8px");
      setSubtractPadding(10);
    } else if(isSmallerThan700) {
      setRowWidth("450px");
      setHistoryFontSize("12px");
      setSubtractPadding(10);
    } else if(isSmallerThan900) {
      setRowWidth("600px");
      setHistoryFontSize("16px");
      setSubtractPadding(0);
    } else {
      setRowWidth("800px");
      setHistoryFontSize("16px");
      setSubtractPadding(0);
    }
  }, [isSmallerThan900, isSmallerThan700, isSmallerThan550])

  // update colors depending on settings colorblind mode state
  useEffect(() => {
    if(profile.settings.colorblindMode) {
      setColors(["var(--colorblind-correct)", "var(--colorblind-incorrect)"])
    } else {
      setColors([winColor, lossColor])
    }
  }, [profile.settings])

  // get the user's game history, depending on selected mode.
  useEffect(() => {
    if(profile.username !== undefined) {
      instance.get(`${process.env.REACT_APP_API_URL}/games/user/hasGame?username=${profile.username}${(mode) ? `&mode=${mode}` : ``}&offset=${offset}&limit=${limit}`).then((response) => {
        if(gamesList[0] === undefined)
          setShowMore(true);
        if(modeChanged) {
          setGamesList([]);
          setModeChanged(false);
        }
        setNumGames(response.data.numGames);
        if(response.data.numGames <= 20)
          setShowMore(false);
        response.data.games.forEach((game) => {
          const date = new Date(game.date);
          var artists = '';
          game.album.artists.forEach((artist, index) => {
            artists += `${artist}${(index !== game.album.artists.length - 1) ? ', ' : ''}`
          });
          setGamesList((gamesList) =>
            [...gamesList, {
              date:`${date.getMonth() + 1}-${date.getDate()}-${date.getYear() + 1900}`,
              id: game.id,
              mode: game.mode,
              win: game.win,
              album: game.album.albumName,
              albumArt: game.album.albumArt,
              artists: artists,
              releaseYear: game.album.releaseYear,
              numGuesses: (game.win) ? game.numGuesses : undefined,
              guesses: game.guesses
            }]
          )
        })
      }).catch((error) => {
        console.log(error);
      })
    }
  }, [profile.username, mode, offset, limit])

  // this method is called to open up a game that the user clicks on from the history table.
  const openGame = (game) => {
    setOpenedGame(game);
    onOpen();
  }

  const doShowMore = () => {
    if(numGames > offset)
      setOffset(offset => offset + 20);
    if(offset + (limit * 2) >= numGames)
      setShowMore(false);
  }

  return (
    <div className="page">
      <div className="title">
        HISTORY
      </div>
      <VStack align="center" mb="50px">
          
        {/* Switch Mode Buttons */}
        <HStack display="flex" width="full" justifyContent="left">
          <HistoryButton
            text={'ALL'}
            onClick={()=>{setMode(); setOffset(0); setShowMore(true); setModeChanged(true); navigate('/history/all')}}
            active={(mode === undefined)}
          />
          <HistoryButton
            text={'CLASSIC'}
            onClick={()=>{setMode('Classic'); setOffset(0); setShowMore(true); setModeChanged(true); navigate('/history/classic')}}
            active={(mode === 'Classic')}
          />
          <HistoryButton
            text={'INFINITE'}
            onClick={()=>{setMode('Infinite'); setOffset(0); setShowMore(true); setModeChanged(true); navigate('/history/infinite')}}
            active={(mode === 'Infinite')}
          />
        </HStack>
        
        {/* Games History Table */}
        <TableContainer width={rowWidth} fontSize={historyFontSize} boxShadow="0px 0px 10px black">
          <Table variant='unstyled' size='md' >
            {/* For each game... */}
            {gamesList.map((game, index) =>
              // Add a new row to the table, colored green if the game result was win, red if loss.
              <Tbody
                key={index}
                bgColor={(game.win) ? colors[0] : colors[1]}
                style={{
                  cursor: "pointer"
                }}
                onClick={()=>{openGame(game)}}
                borderTop={(index === 0) ? "" : "1px solid white"}
              >
                <Tr>
                  <Td display="flex" flexDir="row" pos="relative" p={20 - subtractPadding + "px"}>
                    {/* Display Album art. */}
                    <Image src={game.albumArt} w="60px" h="60px" mr={20 - (subtractPadding / 2) + "px"}/>

                    {/* Display number of guesses, or X if the player lossed that game. */}
                    <Box
                      w="23px" h="23px"
                      borderRadius="23px"
                      border={"2px solid " + (game.win ? colors[0] : colors[1])}
                      bottom={8 - (subtractPadding / 2) + "px"} left={70 - subtractPadding + "px"}
                      align="center" justifyContent="center"
                      pos="absolute"
                      bg="var(--background-color)"
                      fontSize={"16px"}
                    >
                      <Text lineHeight="1">
                        {(game.win) ? game.numGuesses : "X"}
                      </Text>
                    </Box>

                    {/* Display Album name, artist, and release year. */}
                    <VStack align="left" spacing="0">
                      {[game.album,game.artists,game.releaseYear].map((item, index) => {
                        return <Text key={index} fontWeight={(index === 0) && "bold"} h={20 - (subtractPadding / 2) + "px"}>
                            {item}
                          </Text>
                      })}
                    </VStack>

                  </Td>
                  <Td minW="80px" p="0px" pr={20 - subtractPadding + "px"}>
                    {/* Display Game mode and date. */}
                    <VStack align="center" spacing="0">
                      {[game.mode,game.date].map((item, index) => {
                        return <Text key={index} fontWeight={(index === 0) && "bold"}>
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

        {showMore && 
          <MainButton
            text={'SHOW MORE'}
            onClick={doShowMore}
            w="120px"
            m="25px 0px 0px 0px !important"
          />
        }

        {/* Modal: Open Game Info From History Table */}
        <Modal
          isCentered
          onClose={onClose}
          isOpen={isOpen}
          motionPreset='slideInBottom'
        >
          <ModalOverlay />
          {(openedGame) && 
            <ModalContent 
              color="white"
              bgColor="gray.800"
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
                    return <Text key={index} fontWeight={(index === 0) && "bold"}>
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
                    return <Box bg={item.guessCorrectness.album ? colors[0] : colors[1]} w="60px" h="60px" display="flex" justifyContent="center" key={index}
                      border={"2px solid " + (item.guessCorrectness.album ? colors[0] : colors[1])}  
                    >
                      <Tooltip
                        maxW="400px"
                        hasArrow
                        label={(item.albumArt) ? 
                          <VStack spacing="-1">
                            <Text fontWeight="bold">{item.albumName}</Text>
                            <Text >{item.artists.map((artist, index) => `${artist}${(index !== item.artists.length - 1) ? `, ` : ``}`)}</Text>
                            <Text >{item.releaseYear}</Text>
                          </VStack>
                          : 'SKIPPED'
                        }
                        display="flex"
                        bg='var(--background-color)'
                      >
                        {(item.albumArt) ?
                          <Image src={item.albumArt} alt='' w="56px" h="56px" border="0px" alignSelf="center" justifyContent="center"/> :
                          <Text w="60px" p="12px 0px 12px 0px" display="flex" alignSelf="center" justifyContent="center" fontSize="12px">
                            <CloseIcon w="8" h="8"/>
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
          }
        </Modal>
      </VStack>
    </div>
  );
}

export default History;