import { useEffect, useState, useContext } from 'react';
import { instance } from "../helpers/axiosInstance";
import { useLocation } from 'react-router-dom';
import { profileContext } from '../helpers/profileContext';

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

  const { profile, setProfile } = useContext(profileContext);
  const [darkTheme, setDarkTheme] = useState(true);
  const [colorblindMode, setColorblindMode] = useState(false);
  const [colors, setColors] = useState(["green", "yellow", "red"]);
  const [difficulty, setDifficulty] = useState({ label: "Normal", value: 0, color: "green" });
  const [numDays, setNumDays] = useState();

  const location = useLocation();

  useEffect(() => {
    // check if user is logged in. (if so, get and store profile info)
    instance.get(`${process.env.REACT_APP_API_URL}/auth/profile`).then((response) => {
      setProfile({ loggedIn: true, username: response.data.username, settings: response.data.settings });
      setDarkTheme(response.data.settings.darkTheme);
      setColorblindMode(response.data.settings.colorblindMode);
      setDifficulty(difficulties[response.data.settings.difficulty]);
    }).catch(function(error) {
      setProfile({ loggedIn: false, username: undefined, settings: { darkTheme: true, colorblindMode: false, difficulty: 0 } });
      if(error.response)
        console.log(error.response.data);
      else
        console.log({ error: "Cannot authenticate user." });
    });
    
    instance.get(`${process.env.REACT_APP_API_URL}/daily/numDays`).then((response) => {
      setNumDays(response.data.days);
    })
  }, [props.isOpen])

  useEffect(() => {
    // check if user is logged in. (if so, get and store profile info)
    instance.get(`${process.env.REACT_APP_API_URL}/auth/profile`).then((response) => {
      setProfile({ loggedIn: true, username: response.data.username, settings: response.data.settings });
    }).catch(function(error) {
      setProfile({ loggedIn: false, username: undefined, settings: { darkTheme: true, colorblindMode: false, difficulty: 0 } });
      if(error.response)
        console.log(error.response.data);
      else
        console.log({ error: "Cannot authenticate user." });
    });
  }, [location])

  useEffect(() => {
    setProfile({ loggedIn: profile.loggedIn, username: profile.username, settings: { darkTheme: darkTheme, colorblindMode: colorblindMode, difficulty: difficulty.value } })

    if(profile.username) {
      instance.put(`${process.env.REACT_APP_API_URL}/auth/settings`, { username: profile.username, settings: { darkTheme: darkTheme, colorblindMode: colorblindMode, difficulty: difficulty.value }})
      .catch((err) => {
        if(err.response)
          console.log(err.response.data)
        else
          console.log(err.message)
      })
    }
    if(colorblindMode) {
      setColors(["blue", "yellow", "red"]);
    } else {
      setColors(["green", "yellow", "red"]);
    }
  }, [darkTheme, colorblindMode, difficulty])

  return (
    <Modal
      isCentered
      onClose={() => { props.onClose() }}
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
              <VStack>
                <Text width="full" fontWeight="bold">
                  Dark Theme
                </Text>
                <Text fontSize="14" marginBlock="0 !important">
                  Darker Background Colors for Reduced Eye Strain
                </Text>
              </VStack>
              <Switch isDisabled colorScheme={colors[0]} defaultChecked={darkTheme} onChange={() => setDarkTheme(!darkTheme)} />
            </HStack>
            <Divider marginBlock="1rem !important" />
            <HStack width="full" justify="space-between" marginBlock="0 !important">
              <VStack>
                <Text width="full" fontWeight="bold">
                  Colorblind Mode
                </Text>
                <Text fontSize="14" marginBlock="0 !important">
                  High Contrast Colors for Improved Color Vision
                </Text>
              </VStack>
              <Switch colorScheme={colors[0]} defaultChecked={profile.settings.colorblindMode} onChange={() => setColorblindMode(!colorblindMode)} />
            </HStack>

            <Divider marginBlock="1rem !important" />

            <Text as='b' marginBlock="0 !important">
              Difficulty:
            </Text>
            <Tabs colorScheme={colors[difficulty.value]} borderBottom="transparent" defaultIndex={profile.settings.difficulty}>
              <TabList >
                {difficulties.map((item, index) => 
                  <Tooltip
                    hasArrow
                    display="flex"
                    bg='var(--background-color)'
                    label={
                      (item.tooltip) &&
                        <VStack spacing="-1" fontWeight="bold">
                          {item.tooltip}
                        </VStack>
                    }
                    key={index}
                  >
                    <Tab bg="none" onMouseDown={() => setDifficulty({ label: item.label, value: item.value, color: item.color })}>
                      <Text>
                        {item.label}
                      </Text>
                    </Tab>
                  </Tooltip>
                )}
              </TabList>
            </Tabs>
            <Text fontSize="12px" _hover={{cursor:"default"}}>
              Note: Your statistics may be negatively impacted by increasing difficulty.
            </Text>

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
                onClick={()=>{
                  window.location.href = "mailto:support@playvinyle.com?subject=VINYLE Feedback&body="
                }}
              >
                Email
              </Button>
            </HStack>

            <Divider marginBlock="1rem !important" />
          </VStack>
        </ModalBody>

        <ModalFooter width="full" display="flex" justifyContent="space-between">
          <Text color="gray.300">
            VINYLE #{numDays}
          </Text>
          <Text color="gray.300">
            v{process.env.REACT_APP_VERSION}
          </Text>
        </ModalFooter>

      </ModalContent>
    </Modal>
  )
}

export default Settings;