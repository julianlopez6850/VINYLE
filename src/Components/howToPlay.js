import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerCloseButton,
  DrawerBody,
  DrawerFooter,
  VStack,
  HStack,
  Text,
  Box,
  Button,
  Image,
} from '@chakra-ui/react'
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@chakra-ui/icons'

import fullArt from "../assets/htp_examples/VINYLE_full.png"
import firstGuessArt from "../assets/htp_examples/VINYLE_firstGuess.png"
import lastGuessArt from "../assets/htp_examples/VINYLE_lastGuess.png"

import guessEx1 from "../assets/htp_examples/guess1.png"
import guessEx2 from "../assets/htp_examples/guess2.png"
import guessEx3 from "../assets/htp_examples/guess3.png"
import guessEx4 from "../assets/htp_examples/guess4.png"

const correct = "var(--correct)"
const incorrect = "var(--incorrect)"
const partial = "var(--partial)"

export const openHTP = async (e, onOpen) => {
  if(e)
    e.preventDefault();

  onOpen();
}

const HowToPlay = (props) => {

  return (
    <Drawer
      onClose={props.onClose}
      isOpen={props.isOpen}
      placement="left"
      size="lg"
    >
      <DrawerOverlay />
      <DrawerContent 
        color="white"
        bgColor="gray.800"
      >
        <DrawerHeader
          display="flex"
          justifyContent="center"
          fontWeight="bold"
        >
          How To Play
        </DrawerHeader>

        <DrawerCloseButton />

        <DrawerBody>
          <Text display="flex" flexDirection="column">
            <Text fontSize="18">
              Guess the VINYLE in 6 tries.
              <Text><br/></Text>
            </Text>
            - You begin with the bottom-left 1% of an album's cover art.
            <br/>
            - The area you see progressively increases with each guess until you win or lose
            <br/>
            - On the final available attempt, you see the entire bottom-left quarter of the art.
            <br/>
            <Box as='b'>
              <Text><br/></Text>
              Example:
              <VStack mt="10px">
                <HStack spacing="25px" textAlign="center">
                  <Text w="150px" >First Guess</Text>
                  <Text w="150px" >Last Guess</Text>
                  <Text w="150px" >Full Art</Text>
                </HStack>
                <HStack spacing="25px">
                  <Image src={firstGuessArt} w="150px" />
                  <Image src={lastGuessArt} w="150px" />
                  <Image src={fullArt} w="150px" />
                </HStack>
              </VStack>
              <Text><br/></Text>
            </Box>
            <Text fontSize="18">
              You also receive these hints each time you make a guess:
              <Text><br/></Text>
            </Text>
            <Box>
              <Text as='b' color={correct}>Green</Text> indicates a completely correct property
              <br/>
              <Text as='b' color={partial}>Yellow</Text> indicates a 'partially correct' property
              <Box ml="15px">
                <Text as='b' color={partial}>Yellow Artist</Text> indicates that atleast one artist in your guess appears in the answer
                <br/>
                <Text as='b' color={partial}>Yellow Release Year</Text> indicates your guess is within the correct decade
              </Box>
              <Text as='b' color={incorrect}>Red</Text> indicates a completely incorrect property
              <br/>
              <ArrowUpIcon/> indicates the answer release year is newer.
              <br/>
              <ArrowDownIcon/> indicates the answer release year is older.
            </Box>
            <Box>
              <Text><br/></Text>
              <Text as='b'>
                Examples:
              </Text>
              <VStack align="left" whiteSpace="pre-line" mt="10px">
                <HStack>
                  <Text>1)</Text><Image src={guessEx1}/>
                </HStack>
                <Text>
                  <MinusIcon color={incorrect} /> IS NOT 'Thriller'{"\n"}
                  <MinusIcon color={incorrect} /> IS NOT BY Michael Jackson{"\n"}
                  <MinusIcon color={incorrect} /> IS AFTER 1980s{"\n"}
                </Text>
                <HStack>
                  <Text>2)</Text><Image src={guessEx2}/>
                </HStack>
                <Text>
                  <MinusIcon color={incorrect} /> IS NOT 'Watch The Throne'{"\n"}
                  <MinusIcon color={partial} /> IS BY JAY-Z, OR Kanye West, OR ANY COMBINATION + OTHER ARTIST(S){"\n"}
                  <MinusIcon color={partial} /> IS IN 2010s, AFTER 2011{"\n"}
                </Text>
                <HStack>
                  <Text>3)</Text><Image src={guessEx3}/>
                </HStack>
                <Text>
                  <MinusIcon color={incorrect} /> IS NOT 'Talking Book'{"\n"}
                  <MinusIcon color={correct} /> IS BY Stevie Wonder{"\n"}
                  <MinusIcon color={correct} /> IS RELEASED IN 1972{"\n"}
                </Text>
                <HStack>
                  <Text>4)</Text><Image src={guessEx4}/>
                </HStack>
                <Text>
                  <MinusIcon color={correct} /> IS 'Jazz' = YOU WIN!
                </Text>
              </VStack>
              <Text><br/></Text>
              GOOD LUCK, HAVE FUN :)
            </Box>
          </Text>
          
        </DrawerBody>
        <DrawerFooter>
          <Button colorScheme='blue' mr={3} onClick={props.onClose}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default HowToPlay;