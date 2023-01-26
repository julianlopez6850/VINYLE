import { useEffect, useState } from 'react';
import { instance } from "../helpers/axiosInstance";

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

export const resetStats = async (e, username, mode, setStats) => {
  if(e)
    e.preventDefault();
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

const Statistics = (props) => {

  const [mode, setMode] = useState(props.mode)
  const [colorblindMode, setColorblindMode] = useState();

  useEffect(() => {
    setMode(props.mode)

    // check if user is logged in. (if so, get and store state of colorblind mode setting)
    instance.get("http://localhost:5000/auth/profile").then((response) => {
      setColorblindMode(response.data.settings.colorblindMode);
    })
  }, [props.isOpen])

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
        bgColor="gray.800"
      >
        <ModalHeader
          display="flex"
          justifyContent="center"
        >
          {mode ? `${mode} Mode` : `Combined`}  Statistics
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
          {(props.stats.guessDistribution) && [...props.stats.guessDistribution, props.stats.numLosses].map((item, index) => 
            <Box key={`${mode}${index}`}>
              {(index===6) ? "Loss:" : (index + 1) + " Guess Win:"}
              <Progress
                zIndex="-1"
                size='lg'
                colorScheme={(index===6) ? 'red' : (colorblindMode) ? 'blue' : 'green'}
                bgColor="gray.800"
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
          )}
          
        </ModalBody>
        <ModalFooter justifyContent="center">
          {/* Buttons: Switch Current Gamemode of Stats*/}
          {(props.numGuesses === undefined) &&
            [undefined, "Classic", "Infinite"].map((item, index) => 
              (mode !== item) && 
                <Button key={index} colorScheme='blue' marginInline={2} onClick={(e) => {resetStats(e, props.username, item, props.setStats); setMode(item)}}>
                  {item === undefined ? "All" : item}
                </Button> || 
                <Button key={index} colorScheme='blue' outline="1px solid white" marginInline={2} cursor="default" _hover="none" _active="none">
                  {item === undefined ? "All" : item}
                </Button>
            )
          }
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default Statistics;