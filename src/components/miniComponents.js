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
} from '@chakra-ui/react'
import Select from "react-select";

import {
  ArrowUpIcon,
  ArrowDownIcon,
  CloseIcon,
} from '@chakra-ui/icons'

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