import {
	Button
} from '@chakra-ui/react'

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
      onClick={props.onClick}
    >
      {props.text}
    </Button>
  )
}