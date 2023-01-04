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

  const correctGuessColor = props.correctGuessColor;
  const incorrectGuessColor = props.incorrectGuessColor;

  return (
    <TableContainer width={1200} outline={'3px solid white'} borderRadius='10px' m="50px 0px 50px 0px">
      <Table variant='simple' size='md'>
        <Thead>
          <Tr>
            {props.columnHeaders.map((header, index) => {
              if(index !== props.columnHeaders.length - 1)
                return <Th key={index} outline="1px solid white" color='white'>{header}</Th>
              else
                return <Th key={index} outline="1px solid white" color='white' isNumeric>{header}</Th>
            })}
          </Tr>
        </Thead>
        {props.body.map((item, index) =>
          <Tbody key={index}>
            <Tr>
              <Td outline="1px solid white" >
                {index + 1}
              </Td>
              <Td outline="1px solid white" bgColor={(item.guessCorrectness.albumCorrectness) ? correctGuessColor : incorrectGuessColor}>
                {item.albumName}
              </Td>
              <Td outline="1px solid white" bgColor={(item.guessCorrectness.artistCorrectness) ? correctGuessColor : incorrectGuessColor}>
                {item.artists}
              </Td>
              <Td outline="1px solid white" bgColor={(item.guessCorrectness.genreCorrectness) ? correctGuessColor : incorrectGuessColor}>
                {item.genres}
              </Td>
              <Td outline="1px solid white" bgColor={(item.guessCorrectness.releaseYearCorrectness) ? correctGuessColor : incorrectGuessColor} isNumeric>
                {(item.guessCorrectness.releaseYearCorrectness) ? "" : (item.releaseYear) ? ((item.guessCorrectness.releaseYearDirection === "later") ? "^" : "V") : ""}{item.releaseYear}
              </Td>
            </Tr>
          </Tbody>
        )}
        {(props.includeFooter) ?
          <Tfoot>
            <Tr>
              {props.columnHeaders.map((header, index) => {
                if(index !== props.columnHeaders.length - 1)
                  return <Th key={index} outline="1px solid white" color='white'>{header}</Th>
                else
                  return <Th key={index} outline="1px solid white" color='white' isNumeric>{header}</Th>
              })}
            </Tr>
          </Tfoot> : ''
        }
      </Table>
    </TableContainer>
  )
}

export const WinLossToast = (props) => {
  return (
    (props.gameOver) ?
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