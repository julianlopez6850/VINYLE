import {
  Button,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Tfoot,
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
  const pl=["0", "25px", "25px", "0"]
  const textAlign=["center", "left", "left", "center"]
  const columnHeaders = props.columnHeaders.map((header, index) => {
    return { text: header, width: widths[index], pl: pl[index], textAlign: textAlign[index] }
  })

  const correct = props.correctGuessColor;
  const incorrect = props.incorrectGuessColor;

  return (
    <TableContainer width={1080} m="50px 0px 50px 0px" overflowX="hidden">
      <Table variant='unstyled' size='md'>
        <Thead>
          <Tr>
            {columnHeaders.map((header, index) => {
              return <Th key={index} p="0" pl={header.pl} textAlign={header.textAlign} color='white' w={header.width}>{header.text}</Th>
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
                {(item.skipped) ? <CloseIcon/> : item.albumName }
              </Td>
              <Td borderEnd="8px solid var(--background-color)" p="0" pl="25px" bgColor={(item.guessCorrectness.artist) ? correct : incorrect}>
                {(item.skipped) ? <CloseIcon/> : item.artists }
              </Td>
              <Td bgColor={(item.guessCorrectness.releaseYear) ? correct : incorrect} textAlign="center">
                {(item.skipped) ? 
                  <CloseIcon/> : 
                  (item.guessCorrectness.releaseYear) ? 
                    <></> : 
                      ((item.guessCorrectness.releaseYearDirection === "later") ? 
                        <ArrowUpIcon/> : 
                        <ArrowDownIcon/>)
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
    (props.showToast) ?
    (props.win) ?
      (!props.toast.isActive(' ')) ?
        props.toast({
          position: 'top',
          id: ' ',
          title: 'VICTORY',
          description: `You guessed the correct album in ${props.numGuesses} ${(props.numGuesses === 1) ? "try" : "tries"}!`,
          status: 'success',
          duration: 5000,
          isClosable: false
        }) : "" :
      (!props.toast.isActive('')) ?
        props.toast({
          position: 'top',
          id: '',
          title: 'DEFEAT',
          description: 'You failed to guess the correct album',
          status: 'error',
          duration: 5000,
          isClosable: false
        }) : "" :
    ""
  )
}