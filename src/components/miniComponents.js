import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Box,
  Text,
  HStack,
  VStack,
  Progress,
  Divider,
  Skeleton,
} from '@chakra-ui/react'
import Select from "react-select";
import Countdown from '../helpers/countdown';

import {
  ArrowUpIcon,
  ArrowDownIcon,
  CloseIcon,
  CopyIcon,
} from '@chakra-ui/icons'
import { instance } from "../helpers/axiosInstance";

export const MainButton = (props) => {
  return (
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
      m={props.m}
      w={props.w}
      onClick={props.onClick}
    >
      {props.text}
    </Button>
  )
}

export const HistoryButton = (props) => {
  return (
    <Button
      variant='link'
      color={(props.active) ? "white" : "gray.400"}
      borderBottom={(props.active) ? "2px solid white" : "2px solid var(--background-color)"}
      borderRadius="0"
      transition=".3s"
      _hover={(props.active) ? {
        cursor:"default"} : {
        textColor:"gray.200",
        cursor:"pointer"
      }}
      _active={{}}
      p="0px 10px 0px 10px"
      onClick={props.onClick}
    >
      {props.text}
    </Button>
  )
}

export const AlbumSelect = (props) => {
  return (
    <Select
      className="select"
      options={props.options}
      value={props.value}
      onChange={props.onChange}
      styles={{
        control: (baseStyles) => ({
          ...baseStyles,
          backgroundColor: 'var(--gray-700)',
          borderColor: 'black',
          '&:hover': {
            borderColor: 'gray',
            cursor: 'pointer',
          },
        }),
        placeholder: (baseStyles, state) => ({
          ...baseStyles,
          display: 'flex',
          justifyContent: 'left',
          color: state.isFocused ? 'var(--select-hovered)' : 'white',
        }),
        option: (baseStyles, state) => ({
          ...baseStyles,
          display: 'flex',
          justifyContent: 'left',
          color: 'white',
          backgroundColor: state.isFocused ? 'var(--gray-600)' : 'var(--gray-700)',
        }),
        singleValue: (baseStyles) => ({
          ...baseStyles,
          display: 'flex',
          justifyContent: 'left',
          color: 'white',
        }),
        input: (baseStyles) => ({
          ...baseStyles,
          color: 'white',
          '&:hover': {
            cursor: 'text',
          },
        }),
        menu: (baseStyles) => ({
          ...baseStyles,
          color: 'white',
          backgroundColor: 'var(--gray-700)',
        }),
        indicatorSeparator: (baseStyles, state) => ({
          ...baseStyles,
          backgroundColor: state.isFocused ? 'var(--select-hovered)' : 'white',
        }),
      }}
    />
  )
}

export const MainTable = (props) => {

  // styling for column headers
  const widths=["60px", "500px", "400px", "120px"]
  const columnHeaders = props.columnHeaders.map((header, index) => {
    return { text: header, width: widths[index] }
  })

  const correct = props.correctGuessColor;
  const incorrect = props.incorrectGuessColor;
  const partial = props.partialGuessColor;

  return (
    <TableContainer width={1080} m="30px 0px 50px 0px" overflowX="hidden">
      <Table variant='unstyled' size='md'>
        <Thead>
          <Tr>
            {columnHeaders.map((header, index) => {
              return <Th key={index} p="0" textAlign="center" color='white' w={header.width}>{header.text}</Th>
            })}
          </Tr>
        </Thead>
        {props.body.slice(0).reverse().map((item, index) =>
          <Tbody key={index}>
            <Tr borderBlock="20px solid var(--background-color)">
              <Td borderEnd="8px solid var(--background-color)" bgColor="var(--gray-600)" textAlign="center">
                {props.body.length - index}
              </Td>
              <Td borderEnd="8px solid var(--background-color)" p="0" pl="25px" bgColor={(item.guessCorrectness.album) ? correct : incorrect}>
                {(item.albumName) || <CloseIcon/>}
              </Td>
              <Td borderEnd="8px solid var(--background-color)" p="0" pl="25px" bgColor={(item.guessCorrectness.artist) ? (item.guessCorrectness.artist === "correct") ? correct : partial : incorrect}>
                {(item.artists) ? 
                  item.artists.map((artist, index) => `${artist}${(index !== item.artists.length - 1) ? `, ` : ``}`) : 
                  <CloseIcon/>
                }
              </Td>
              <Td bgColor={(item.guessCorrectness.releaseYear) ? (item.guessCorrectness.releaseYear === "correct") ? correct : partial : incorrect} textAlign="center">
                {(item.releaseYear) ? 
                  ((item.guessCorrectness.releaseYear === "correct") ? 
                    <></> : 
                    ((item.guessCorrectness.releaseYearDirection === "later") ? 
                      <ArrowUpIcon/> : 
                      <ArrowDownIcon/>)) : 
                  <CloseIcon/>
                }
                {item.releaseYear}
              </Td>
            </Tr>
          </Tbody>
        )}
      </Table>
    </TableContainer>
  )
}

export const WinLossToast = (props) => {
  return (
    (props.showToast) &&
      ((props.win) ?
        ((!props.toast.isActive(' ')) &&
          props.toast({
            position: 'top',
            id: ' ',
            title: 'VICTORY',
            description: `You guessed the correct album in ${props.numGuesses} ${(props.numGuesses === 1) ? "try" : "tries"}!`,
            status: 'success',
            duration: 5000,
            isClosable: false
          })) :
        ((!props.toast.isActive('')) &&
          props.toast({
            position: 'top',
            id: '',
            title: 'DEFEAT',
            description: 'You failed to guess the correct album',
            status: 'error',
            duration: 5000,
            isClosable: false
          })))
  )
}

export const GuessRow = (props) => {
  return (
    <Box width={props.w} height={props.h}>
      <HStack>
        <Box width={props.albumW} height={props.h} bgColor={props.albumBGC}>
          <Text pt="6px" pl="15px">
            {props.album}
          </Text>
        </Box>
        <Box width={props.artistW} height={props.h} bgColor={props.artistBGC}>
          <Text pt="6px" pl="15px">
            {props.artist}
          </Text>
        </Box>
        <Box width={props.releaseW} height={props.h} bgColor={props.releaseBGC}>
          <Text align="center"  pt="6px">
            {props.releaseDir}{props.release}
          </Text>
        </Box>
      </HStack>
    </Box>
  )
}

export const ClassicResults = (props) => {

  const [gameData, setGameData] = useState();

  // GET the Current Day's Classic VINYLE Game Stats to Compare With Other Users
  useEffect(() => {
    instance.get(`http://localhost:5000/daily?date=${props.date}`).then((response) => {
      setGameData(response.data.game);
    })
  }, [props.isOpen])

  // Copy Share Text to Clipboard...
  const doShare = () => {
    // implement doShare code...
  }

  const navigate = useNavigate();

  return (
    (props.isOpen) &&
      <Box w="400px" paddingBlock="10px" mb="50px" align="center" border="3px solid var(--gray-600)" borderRadius="10px" borderColor={(props.win) ? props.winColor : props.loseColor} bg="gray.900">
        <Text fontWeight="bold" fontSize="24px">
          {(props.win) ? "Congratulations!" : "Not This Time..."}
        </Text>
        <Text>
          {(props.win) ? `You won today's Classic VINYLE in ${props.guesses} ${props.guesses === 1 ? 'guess' : 'guesses'}!` : "Come back tommorrow for another shot at it!"}
        </Text>

        <Divider border="1px solid" borderColor="white" w="250px" marginBlock="10px"/>

        {(gameData) && (
          <VStack>
            <Text whiteSpace="pre-line">
                {`You are the ${gameData.numPlayed}${(gameData.numPlayed % 10 === 1) ? `st` : (gameData.numPlayed % 10 === 2) ? `nd` : (gameData.numPlayed % 10 === 3) ? `rd` : `th`} to play today's Classic VINYLE
                Here is how you stacked up against all players:`}
            </Text>
            <VStack w="350px" h="200px" mt="10px" display="flex" spacing="5px">
              {[gameData.num1Guess, gameData.num2Guess, gameData.num3Guess, gameData.num4Guess, gameData.num5Guess, gameData.num6Guess, gameData.numLosses].map((item, index) => 
                <HStack key={`${index}`} align="center">
                  <Text>
                    {(index===6) ? "X:" : (index + 1) + ":" }
                  </Text>
                  <Box w="300px" zIndex="1" textAlign="left" >
                    <Progress
                      mt="5px"
                      justifyContent="left"
                      zIndex="-1"
                      size='lg'
                      colorScheme={(index===6) ? 'red' : 'black'}
                      bgColor={(index===6) ? props.loseColor : props.winColor}
                      width={(gameData) ? `${Math.max((item / gameData.mostFrequent) * 300, 20)}px` : "300px"}
                      value={100}
                      hasStripe={(props.win) ? props.guesses - 1 === index : index === 6}
                    />
                    <Box
                      m="-21px 0px 0px 5px"
                      textAlign="left" 
                    >
                      {item}
                    </Box>
                  </Box>
                </HStack>
              )}
            </VStack>
          </VStack>
        ) || (
          <VStack height="256px" spacing="2.5">
            <Skeleton height='18px' width="300px"/>
            <Text>LOADING CLASSIC GAME DATA...</Text>
            <Skeleton height='18px' width="300px"/>
            <Skeleton height='18px' width="300px"/>
            <Skeleton height='18px' width="300px"/>
            <Skeleton height='18px' width="300px"/>
            <Skeleton height='18px' width="300px"/>
            <Skeleton height='18px' width="300px"/>
            <Skeleton height='18px' width="300px"/>
          </VStack>
        )}
        <Button
          w="125px"
          m="5px 0px 0px 0px"
          color="white"
          bgColor="gray.700"
          border="1px solid black"
          _hover={{
            border:"1px solid var(--gray-600)"
          }}
          _active={{}}
          onClick={doShare}
        >
          <CopyIcon/><Text whiteSpace="pre-wrap">{`   SHARE`}</Text>
        </Button>

        <Divider border="1px solid" borderColor="white" w="250px" marginBlock="10px"/>

        <VStack w="300px" display="flex" spacing="0">
          <Text fontWeight="semibold">
            Time Until Next Classic VINYLE:
          </Text>
          <Text fontSize="36px">
            <Countdown
              isOpen={props.isOpen}
            />
          </Text>
        </VStack>

        <Divider border="1px solid" borderColor="white" w="250px" marginBlock="10px"/>

        <Text fontWeight="semibold">
          In the mean time, you can...
        </Text>
        <Button
          w="175px"
          m="5px 0px 10px 0px"
          color="white"
          bgColor="gray.700"
          border="1px solid black"
          _hover={{
            border:"1px solid var(--gray-600)"
          }}
          _active={{}}
          onClick={() => navigate('/infinite')}
        >
          PLAY INFINITE MODE
        </Button>
      </Box>
  )
}