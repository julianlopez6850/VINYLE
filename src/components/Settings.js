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
  HStack,
  VStack,
  Text,
  Switch,
  Divider,
  Tabs,
  TabList,
  Tab,
  Tooltip,
} from '@chakra-ui/react'

const Settings = (props) => {

  const difficulties = [
    { label: "Normal", value: 0, color: "green", tooltip: undefined }, 
    { label: "Hard", value: 1, color: "yellow", tooltip: 
      <><Text>Normal Mode</Text>
      <Text>+ Grayscale</Text></>
    }, 
    { label: "Extreme", value: 2, color: "red", tooltip: 
      <><Text>Hard Mode</Text>
      <Text>+ Inverted Color</Text>
      <Text>+ Random Rotation</Text></>
    }
  ];

  const [username, setUsername] = useState("");
  const [darkTheme, setDarkTheme] = useState(true);
  const [colorblindMode, setColorblindMode] = useState(false);
  const [difficulty, setDifficulty] = useState({ label: "Normal", value: 0, color: "green" });
  const [numDays, setNumDays] = useState();

  useEffect(() => {
    // check if user is logged in. (if so, get and store username)
    instance.get("http://localhost:5000/auth/profile").then((response) => {
      setUsername(response.data.username)
      setDarkTheme(response.data.settings.darkTheme);
      setColorblindMode(response.data.settings.colorblindMode);
      setDifficulty(difficulties[response.data.settings.difficulty]);
    }).catch(function(error) {
      if(error.response)
        console.log(error.response.data);
      else
        console.log({ error: "Cannot authenticate user." });
    });
  }, [])
  
  useEffect(() => {
    instance.get("http://localhost:5000/daily/numDays").then((response) => {
      setNumDays(response.data.days);
    })
  }, [numDays])

  useEffect(() => {
    if(username) {
      instance.put("http://localhost:5000/auth/settings", {username: username, settings: { darkTheme: darkTheme, colorblindMode: colorblindMode, difficulty: difficulty.value }}).catch((err) => {
        if(err.response)
          console.log(err.response.data)
        else
          console.log(err.message)
      })
    }
  }, [darkTheme, colorblindMode, difficulty])

  return (
    <Modal
      isCentered
      onClose={() => {setNumDays(numDays => numDays - 1); props.onClose()}}
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
          Settings
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody>
          <VStack>

            <HStack width="full" justify="space-between">
              <Text>
                Dark Theme
              </Text>
              <Switch defaultChecked={darkTheme} onChange={() => setDarkTheme(!darkTheme)} />
            </HStack>
            <Divider marginBlock="1rem !important" />
            <HStack width="full" justify="space-between" marginBlock="0 !important">
              <Text>
                Colorblind Mode
              </Text>
              <Switch defaultChecked={colorblindMode} onChange={() => setColorblindMode(!colorblindMode)} />
            </HStack>

            <Divider marginBlock="1rem !important" />

            <Text as='b' marginBlock="0 !important">
              Difficulty:
            </Text>
            <Tabs colorScheme={difficulty.color} borderBottom="transparent" defaultIndex={difficulty.value}>
              <TabList >
                {difficulties.map((item) => 
                  <Tooltip
                    hasArrow
                    display="flex"
                    bg='var(--background-color)'
                    label={
                      <VStack spacing="-1" fontWeight="bold">
                        {item.tooltip}
                      </VStack>
                    }
                  >
                    <Tab bg="none" onMouseDown={()=>{setDifficulty({ label: item.label, value: item.value, color: item.color })}}>
                        <Text>
                          {item.label}
                        </Text>
                    </Tab>
                  </Tooltip>
                )}
              </TabList>
            </Tabs>

            <Divider marginBlock="1rem !important" />

            <HStack width="full" justify="space-between" marginBlock="0 !important">
              <Text>
                Feedback
              </Text>
              <Button
                variant='link'
                color="gray.300"
                borderColor="gray.300"
                borderBottom="1px solid"
                borderRadius="0"
                transition=".3s"
                _hover={{
                  cursor:"pointer",
                  color:"white",
                  borderColor:"white"
                }}
                _active={{}}
                onClick={()=>{/* INSERT EMAIL CODE HERE */}}
              >
                Email
              </Button>
            </HStack>

            <Divider marginBlock="1rem !important" />
          </VStack>
        </ModalBody>

        <ModalFooter width="full" display="flex" justifyContent="space-between">
          <Text color="gray.300">
            Daily VINYLE #{numDays}
          </Text>
          <Button colorScheme='blue' mr={3} onClick={() => {setNumDays(numDays => numDays - 1); props.onClose()}}>
            Close
          </Button>
        </ModalFooter>

      </ModalContent>
    </Modal>
  )
}

export default Settings;