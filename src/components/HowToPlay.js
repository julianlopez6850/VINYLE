import { useState, useEffect } from 'react'
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
  Divider,
} from '@chakra-ui/react'
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@chakra-ui/icons'
import { instance } from '../helpers/axiosInstance'
import { GuessRow } from './miniComponents'

import FullArt from "../assets/htp_examples/VINYLE_full.png"
import FirstGuessArt from "../assets/htp_examples/VINYLE_firstGuess.png"
import LastGuessArt from "../assets/htp_examples/VINYLE_lastGuess.png"
import ColorblindFullArt from "../assets/htp_examples/VINYLE_full_colorblind.png"
import ColorblindFirstGuessArt from "../assets/htp_examples/VINYLE_firstGuess_colorblind.png"
import ColorblindLastGuessArt from "../assets/htp_examples/VINYLE_lastGuess_colorblind.png"

export const openHTP = async (e, onOpen) => {
  if(e)
    e.preventDefault();

  onOpen();
}

const HowToPlay = (props) => {
  const [colors, setColors] = useState({colors: ["var(--correct)", "var(--partial)", "var(--incorrect)"], labels: ["Green", "Yellow", "Red"]});
  const [exampleImage, setExampleImage] = useState({ full: FullArt, first: FirstGuessArt, last: LastGuessArt })

  useEffect(() => {
    if(props.colorblindMode) {
      setColors({colors: ["var(--colorblind-correct)", "var(--colorblind-partial)", "var(--colorblind-incorrect)"], labels: ["Blue", "Orange", "Red"]});
      setExampleImage({ full: ColorblindFullArt, first: ColorblindFirstGuessArt, last: ColorblindLastGuessArt });
    } else {
      setColors({colors: ["var(--correct)", "var(--partial)", "var(--incorrect)"], labels: ["Green", "Yellow", "Red"]});
      setExampleImage({ full: FullArt, first: FirstGuessArt, last: LastGuessArt });
    }
  }, [props.isOpen])

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
          <Box display="flex" flexDirection="column">
            <Text fontSize="18" mb="5px">
              Guess the VINYLE in 6 tries.
            </Text>
            - You begin by viewing a small portion of the album's cover art.
            <br/>
            - The area you see progressively increases with each guess until you win or lose
            <br/>
            - On your final available attempt, you are able to see most of the album art.
            <Text><br/></Text>
            <Divider/>
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
                  <Image src={exampleImage.first} w="150px" />
                  <Image src={exampleImage.last} w="150px" />
                  <Image src={exampleImage.full} w="150px" />
                </HStack>
              </VStack>
              <Text><br/></Text>
            </Box>
            <Divider/>
            <Text><br/></Text>
            <Text fontSize="18" mb="15px">
              You also receive these hints each time you make a guess:
            </Text>
            <Box>
              <Text as='b' color={colors.colors[0]}>{colors.labels[0]}</Text> indicates a completely correct property
              <br/>
              <Text as='b' color={colors.colors[1]}>{colors.labels[1]}</Text> indicates a 'partially correct' property:
              <Box ml="15px">
                <Text as='b' color={colors.colors[1]}>{colors.labels[1]} Artist</Text> indicates that atleast one artist in your guess appears in the answer
                <br/>
                <Text as='b' color={colors.colors[1]}>{colors.labels[1]} Release Year</Text> indicates your guess is within the correct decade
              </Box>
              <Text as='b' color={colors.colors[2]}>{colors.labels[2]}</Text> indicates a completely incorrect property
              <br/>
              <ArrowUpIcon/> indicates the answer release year is newer.
              <br/>
              <ArrowDownIcon/> indicates the answer release year is older.
            </Box>
            <Text><br/></Text>
            <Divider/>
            <Box>
              <Text><br/></Text>
              <Text as='b'>
                Examples:
              </Text>
              <VStack align="left" whiteSpace="pre-line" mt="10px">
                <HStack>
                  <Text>
                    1)
                  </Text>
                  <GuessRow
                    h="38px"
                    albumW="250px" artistW="250px" releaseW="85px"
                    albumBGC={colors.colors[2]} artistBGC={colors.colors[2]} releaseBGC={colors.colors[2]}
                    album="Thriller" artist="Michael Jackson" release="1982" releaseDir={<ArrowDownIcon/>}
                  />
                </HStack>
                <Text>
                  <MinusIcon color={colors.colors[2]} /> IS NOT 'Thriller'{"\n"}
                  <MinusIcon color={colors.colors[2]} /> IS NOT BY Michael Jackson{"\n"}
                  <MinusIcon color={colors.colors[2]} /> IS BEFORE 1980s{"\n"}
                </Text>

                <HStack>
                  <Text>
                    2)
                  </Text>
                  <GuessRow
                    h="38px"
                    albumW="250px" artistW="250px" releaseW="85px"
                    albumBGC={colors.colors[2]} artistBGC={colors.colors[1]} releaseBGC={colors.colors[1]}
                    album="Watch The Throne" artist="JAY-Z, Kanye West" release="2011" releaseDir={<ArrowUpIcon/>}
                  />
                </HStack>
                <Text>
                  <MinusIcon color={colors.colors[2]} /> IS NOT 'Watch The Throne'{"\n"}
                  <MinusIcon color={colors.colors[1]} /> IS BY JAY-Z, OR Kanye West, OR ANY COMBINATION + OTHER ARTIST(S){"\n"}
                  <MinusIcon color={colors.colors[1]} /> IS IN 2010s, AFTER 2011{"\n"}
                </Text>

                <HStack>
                  <Text>
                    3)
                  </Text>
                  <GuessRow
                    h="38px"
                    albumW="250px" artistW="250px" releaseW="85px"
                    albumBGC={colors.colors[2]} artistBGC={colors.colors[0]} releaseBGC={colors.colors[0]}
                    album="Talking Book" artist="Stevie Wonder" release="1972" releaseDir={undefined}
                  />
                </HStack>
                <Text>
                  <MinusIcon color={colors.colors[2]} /> IS NOT 'Talking Book'{"\n"}
                  <MinusIcon color={colors.colors[0]} /> IS BY Stevie Wonder{"\n"}
                  <MinusIcon color={colors.colors[0]} /> IS RELEASED IN 1972{"\n"}
                </Text>

                <HStack>
                  <Text>
                    4)
                  </Text>
                  <GuessRow
                    h="38px"
                    albumW="250px" artistW="250px" releaseW="85px"
                    albumBGC={colors.colors[0]} artistBGC={colors.colors[0]} releaseBGC={colors.colors[0]}
                    album="Jazz" artist="Queen" release="1978" releaseDir={undefined}
                  />
                </HStack>
                <Text>
                  <MinusIcon color={colors.colors[0]} /> IS 'Jazz' = YOU WIN!
                </Text>
              </VStack>
              <Text><br/></Text>
              GOOD LUCK, HAVE FUN :)

            </Box>
          </Box>
          
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