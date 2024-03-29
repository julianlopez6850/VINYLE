import React, { useState, useEffect, useContext } from "react";
import "../styles/navbar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { instance } from "../helpers/axiosInstance";
import ConditionalLink from "../helpers/conditionalLink";
import Settings from "./Settings";
import Statistics, { getStats, resetStats } from "./Statistics"; 
import HowToPlay, { openHTP } from "./HowToPlay";
import { profileContext } from '../helpers/profileContext';

import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  IconButton,
  useDisclosure,
  MenuGroup,
  Text,
} from '@chakra-ui/react'

import {
  HamburgerIcon,
  SettingsIcon
} from '@chakra-ui/icons'

function Navbar() {
  const { profile, setProfile } = useContext(profileContext);
  const [stats, setStats] = useState({});
  const [mode, setMode] = useState();

  const location = useLocation();
  const navigate = useNavigate();
  // Settings Modal useDisclosure
  const {
    isOpen: isOpenSettings,
    onOpen: onOpenSettings,
    onClose: onCloseSettings
  } = useDisclosure();
  // Statistics Modal useDisclosure
  const {
    isOpen: isOpenStatsModal,
    onOpen: onOpenStatsModal,
    onClose: onCloseStatsModal
  } = useDisclosure();
  // How To Play Drawer useDisclosure
  const {
    isOpen: isOpenHTP,
    onOpen: onOpenHTP,
    onClose: onCloseHTP
  } = useDisclosure();

  // when the url changes...
  useEffect(() => {
    // set mode depending on pathname
    if(location.pathname.includes("/classic"))
      setMode("Classic");
    else if(location.pathname.includes("/infinite"))
      setMode("Infinite");
    else
      setMode();
  }, [location])

  // this function will handle logging out the user.
  const logout = async (e) => {
    e.preventDefault();
    if(profile.loggedIn) {
      await instance.post(`${process.env.REACT_APP_API_URL}/auth/logout`).then((response) => {
        console.log("User logged out.");
        setProfile({ loggedIn: false, username: undefined, settings: { darkTheme: true, colorblindMode: false, difficulty: 0 } });
      }).catch(function(error) {
        if(error.response)
          console.log(error.response.data);
        else
          console.log({ error: "Error logging out user." });
      })
    }
  }
      
  return (
    <div className="navbar">
      <div className="navbar-content">

        <div className="content-left">
        <Menu closeOnSelect={false}>
          <MenuButton
            ml="1.25rem"
            mr="1.25rem"
            colorScheme='white'
            as={IconButton}
            aria-label='Options'
            icon={<HamburgerIcon />}
            variant='outline'
            _hover={{ bgColor: "gray.800" }}
          />
            <MenuList
              bgColor="gray.900"
              color="white"
            >
              <MenuItem
                fontSize="16px"
                value='stats'
                bgColor="gray.900"
                _hover={{ bgColor: "gray.600" }}
                onClick={(e) => openHTP(e, onOpenHTP)}
              >
                How To Play
              </MenuItem>

              <MenuDivider/>

              <MenuGroup
                mt="0"
                textAlign="left"
                fontWeight="bold"
                title="Game Modes"
              >
                <MenuItem
                  fontSize="16px"
                  value='stats'
                  bgColor="gray.900"
                  _hover={{ bgColor: "gray.600" }}
                  onClick={() => {navigate('/classic')}}
                >
                  Classic
                </MenuItem>
                <MenuItem
                  fontSize="16px"
                  value='logout'
                  bgColor="gray.900"
                  _hover={{ bgColor: "gray.600" }}
                  onClick={() => {navigate('/infinite')}}
                >
                  Infinite
                </MenuItem>
              </MenuGroup>
            </MenuList>
          </Menu>
        </div>

        <div className="content-middle">
          {/* if gamemode is not classic, VINYLE page title becomes a link to the main page.*/}
          <Button
            padding={"inherit"}
            fontSize={48}
            height="inherit"
            bgColor={"transparent"}
            _hover={{ background: "transparent", color: "blue.500" }}
            _active={{ background: "transparent" }}
          >
            <ConditionalLink
              to="/classic"
              condition={!(location.pathname === "/classic")}
              style={{
                height:"inherit",
                padding:"0px 10px 0px 10px"
              }}
            >
              VINYLE
            </ConditionalLink>
          </Button>
        </div>

        <div className="content-right">
          {profile.loggedIn ? 
            <Menu closeOnSelect={false}>
              <MenuButton
                as={Button}
                colorScheme='black'
                border='1px solid white'
                ml="1.25rem"
                mr="2.5rem"
                width="50"
                _hover={{ bgColor: "gray.800" }}
              >
                <SettingsIcon/>
              </MenuButton>
              <MenuList
                bgColor="gray.900" width="100px" 
                color="white"
              >
                <MenuGroup
                  mb="0"
                  textAlign="left"
                  fontSize="16px"
                  fontWeight="normal"
                  title="Signed in as"
                />
                <MenuGroup
                  mt="0"
                  textAlign="left"
                  fontWeight="bold"
                  fontSize="14px"
                  mr="5px"
                  title={profile.username}
                />
                <MenuDivider/>
                <MenuItem
                  fontSize="16px"
                  value='stats'
                  bgColor="gray.900"
                  _hover={{ bgColor: "gray.600" }}
                  onClick={onOpenSettings}
                >
                  Settings
                </MenuItem>
                <MenuItem
                  fontSize="16px"
                  value='stats'
                  bgColor="gray.900"
                  _hover={{ bgColor: "gray.600" }}
                  onClick={() => {navigate('/history')}}
                >
                  History
                </MenuItem>
                <MenuItem
                  fontSize="16px"
                  value='stats'
                  bgColor="gray.900"
                  _hover={{ bgColor: "gray.600" }}
                  onClick={(e) => getStats(e, profile.loggedIn, profile.username, mode, setStats, onOpenStatsModal)}
                >
                  Statistics
                </MenuItem>
                <MenuDivider/>
                <MenuItem
                  fontSize="16px"
                  value='logout'
                  bgColor="gray.900"
                  _hover={{ bgColor: "gray.600" }}
                  onClick={(e) => logout(e)}
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu> :
            <Button
              height="inherit"
              padding="inherit"
              bgColor="transparent"
              _hover={{ background: "transparent", color: "blue.500" }}
              _active={{ background: "transparent" }}
            >
              <Link 
                to="/login" 
                style={{
                  width:"15",
                  paddingLeft:"1.25rem",
                  paddingRight:"2.5rem",
                  height:"inherit", 
                  display:"inherit",
                  alignItems:"center"
                }}
              >
                Login
              </Link>
            </Button>
          }
        </div>

        {/* Settings Modal */}
        <Settings
          mode={mode}
          stats={stats}
          username={profile.username}
          onClose={onCloseSettings}
          isOpen={isOpenSettings}
        />

        {/* Stats Modal */}
        <Statistics
          mode={mode}
          colorblindMode={profile.settings.colorblindMode}
          stats={stats}
          resetStats={resetStats}
          setStats={setStats}
          username={profile.username}
          onClose={onCloseStatsModal}
          isOpen={isOpenStatsModal}
        />

        {/* How To Play Drawer */}
        <HowToPlay
          onClose={onCloseHTP}
          isOpen={isOpenHTP}
          colorblindMode={profile.settings.colorblindMode}
        />
        
      </div>
    </div>
  );
}

export default Navbar;
