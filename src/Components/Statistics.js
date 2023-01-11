import { instance } from "../Helpers/axiosInstance";

import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Progress,
  HStack,
  VStack,
  Text,
  Box,
} from '@chakra-ui/react'

export const getStats = async (e, loggedIn, username, mode, setStats, onOpen) => {
  if(e)
    e.preventDefault();
  if(loggedIn)
  {
    await instance.get(`http://localhost:5000/games/user/stats?username=${username}${(mode) ? `&mode=${mode}` : ``}`).then(async (response) => {
      if(response.data.game) {
        const data = response.data.game;
        setStats({ numGames: data.numGames,
          numWins: data.numWins,
          numLosses: data.numLosses,
          winPercent: data.winPercent,
          guessDistribution: data.guessDistribution,
          avgGuessesPerWin: data.avgGuessesPerWin,
          mostFrequent: data.mostFrequent
        });
      } else {
        console.log(response.data.message);
        setStats({ numGames: 0,
          numWins: 0,
          numLosses: 0,
          winPercent: 0,
          guessDistribution: [0, 0, 0, 0, 0, 0],
          avgGuessesPerWin: 0,
          mostFrequent: 1
        });
      }
    }).catch(function(error) {
      console.log(error);
    })
  }
  onOpen();
}

const Statistics = (props) => {

  return (
    <Modal
      isCentered
      onClose={props.onClose}
      isOpen={props.isOpen}
      motionPreset='slideInBottom'
    >
      <ModalOverlay />
      <ModalContent 
        color="white"
        bgColor="gray.700"
      >
        <ModalHeader
          display="flex"
          justifyContent="center"
        >
          {props.mode ? `${props.mode} Mode` : ``}  Statistics
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody>

          {/* Display basic stats */}
          <HStack align="top" justifyContent="space-evenly" textAlign="center">
            {[{title: 'Games Played', stat: props.stats.numGames},
              {title: 'Wins', stat: props.stats.numWins},
              {title: 'Losses', stat: props.stats.numLosses},
              {title: 'Win %', stat: props.stats.winPercent},
              {title: 'Avg Guesses', stat: props.stats.avgGuessesPerWin}
            ].map((item, index) => 
              <VStack key={index} minWidth="65px" width="fit-content" spacing="-2">
                <Text fontSize="36" fontWeight="bold">
                  {item.stat}
                </Text>
                <Text width="65px">
                  {item.title}
                </Text>
              </VStack>
            )}
          </HStack>

          <br/>

          {/* Display Guess distribution */}
          <Text display="flex" justifyContent="center" fontWeight="bold">
            Guess Distribution:
          </Text>
          {(props.stats.guessDistribution) ? [...props.stats.guessDistribution, props.stats.numLosses].map((item, index) => {
            return (
              <Box key={index}>
                {(index===6) ? "Loss:" : (index + 1) + " Guess Win:"}
                <Progress
                  zIndex="-1"
                  size='lg'
                  colorScheme={(index===6) ? 'red' : 'green'}
                  bgColor="gray.700"
                  value={Math.max((item / props.stats.mostFrequent) * 100, 5)}
                  hasStripe={props.numGuesses === index}
                />
                <Box
                  m="-21px 0px 0px 5px"
                  textAlign="left" 
                >
                  {item}
                </Box>
              </Box>
          )}) : ""}
          
        </ModalBody>
        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={props.onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default Statistics;