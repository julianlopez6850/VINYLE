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

  const [difficulty, setDifficulty] = useState({label: "normal", value: 0 });

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
          Settings
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody>
          <VStack>

            <HStack width="full" justify="space-between">
              <Text>
                Dark Theme
              </Text>
              <Switch defaultChecked />
            </HStack>
            <Divider marginBlock="1rem !important" />
            <HStack width="full" justify="space-between" marginBlock="0 !important">
              <Text>
                Colorblind Mode
              </Text>
              <Switch />
            </HStack>

            <Divider marginBlock="1rem !important" />

            <Text as='b' marginBlock="0 !important">
              Difficulty:
            </Text>
            <Tabs colorScheme={(difficulty.label === "normal") ? "green" : (difficulty.label === "hard") ? "yellow" : "red"} borderBottom="transparent" defaultIndex={difficulty.value}>
              <TabList >
                <Tab bg="none" onMouseDown={()=>{setDifficulty({ label: "normal", value: 0 })}}>
                  Normal
                </Tab>
                <Tooltip
                  hasArrow
                  display="flex"
                  bg='var(--background-color)'
                  label={
                    <VStack spacing="-1" fontWeight="bold">
                      <Text>Normal Mode</Text>
                      <Text>+ Grayscale</Text>
                    </VStack>
                  }
                >
                  <Tab bg="none" onMouseDown={()=>{setDifficulty({ label: "hard", value: 1 })}}>
                      <Text>
                        Hard
                      </Text>
                  </Tab>
                </Tooltip>
                <Tooltip
                  hasArrow
                  display="flex"
                  bg='var(--background-color)'
                  label={
                    <VStack spacing="-1" fontWeight="bold">
                      <Text>Hard Mode</Text>
                      <Text>+ Inverted Color</Text>
                      <Text>+ Random Rotation</Text>
                    </VStack>
                  }
                >
                  <Tab bg="none" onMouseDown={()=>{setDifficulty({ label: "extreme", value: 2 })}}>
                      Extreme
                  </Tab>
                </Tooltip>
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

            <HStack width="full" justify="right">
              <Text>
                #[Insert Daily Number Here]
              </Text>
            </HStack>

          </VStack>
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

export default Settings;