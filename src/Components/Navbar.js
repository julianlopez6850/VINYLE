import React, { useState, useEffect } from "react";
import "../styles/navbar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { instance } from "../Helpers/axiosInstance";
import ConditionalLink from "../Helpers/conditionalLink";
import Statistics, { getStats } from "../Components/Statistics"
import HowToPlay, { openHTP } from "../Components/howToPlay";

import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react'

import {
  HamburgerIcon,
  SettingsIcon
} from '@chakra-ui/icons'

function Navbar() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [stats, setStats] = useState({});
  const [mode, setMode] = useState();

  const location = useLocation();
  const navigate = useNavigate();
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
    // check if user is logged in. (if so, get and store username)
    instance.get("http://localhost:5000/auth/profile").then((response) => {
      setLoggedIn(true);
      setUsername(response.data.username)
    }).catch(function(error) {
      setLoggedIn(false);
      if(error.response)
        console.log(error.response.data);
      else
        console.log({ error: "Cannot authenticate user." });
    });

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
    if(loggedIn)
    {
      await instance.post('http://localhost:5000/auth/logout').then((response) => {
        console.log("User logged out.");
        setLoggedIn(false);
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
            ml="5"
            mr="5"
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
                value='stats'
                bgColor="gray.900"
                _hover={{ bgColor: "gray.600" }}
                onClick={(e) => openHTP(e, onOpenHTP)}
              >
                How To Play
              </MenuItem>

              <MenuDivider/>

              <MenuItem
                value='stats'
                bgColor="gray.900"
                _hover={{ bgColor: "gray.600" }}
                onClick={() => {navigate('/classic')}}
              >
                Classic
              </MenuItem>
              <MenuItem
                value='logout'
                bgColor="gray.900"
                _hover={{ bgColor: "gray.600" }}
                onClick={() => {navigate('/infinite')}}
              >
                Infinite
              </MenuItem>
            </MenuList>
          </Menu>
        </div>

        <div className="content-middle">
          <Button
            padding={"inherit"}
            fontSize={48}
            height="inherit"
            bgColor={"transparent"}
            _hover={{ background: "transparent", color: "blue.500" }}
            _active={{ background: "transparent" }}
          >
            {
              // if gamemode is not classic, VINYLE page title becomes a link to the main page.
              <ConditionalLink
                to="/"
                condition={(location.pathname.includes("/classic") && !(location.pathname.includes("/history")))}
                style={{
                  height:"inherit",
                  padding:"0px 10px 0px 10px"
                }}
              >
                VINYLE
              </ConditionalLink>
            }
          </Button>
        </div>

        <div className="content-right">
          {loggedIn ? 
            <Menu closeOnSelect={false}>
              <MenuButton
                as={Button}
                colorScheme='black'
                border='1px solid white'
                ml="5"
                mr="5"
                width="50"
                _hover={{ bgColor: "gray.800" }}
              >
                {username}
              </MenuButton>
              <MenuList
                bgColor="gray.900"
                color="white"
              >
                <MenuItem
                  value='stats'
                  bgColor="gray.900"
                  _hover={{ bgColor: "gray.600" }}
                >
                  Settings
                </MenuItem>
                <MenuItem
                  value='stats'
                  bgColor="gray.900"
                  _hover={{ bgColor: "gray.600" }}
                  onClick={() => {navigate('/history')}}
                >
                  History
                </MenuItem>
                <MenuItem
                  value='stats'
                  bgColor="gray.900"
                  _hover={{ bgColor: "gray.600" }}
                  onClick={(e) => getStats(e, loggedIn, username, mode, setStats, onOpenStatsModal)}
                >
                  Statistics
                </MenuItem>
                <MenuDivider/>
                <MenuItem
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
                  paddingLeft:"10px",
                  paddingRight:"10px",
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

        {/* Stats Modal */}
        <Statistics
          mode={mode}
          stats={stats}
          onClose={onCloseStatsModal}
          isOpen={isOpenStatsModal}
        />

        {/* How To Play Drawer */}
        <HowToPlay
          onClose={onCloseHTP}
          isOpen={isOpenHTP}
        />
        
      </div>
    </div>
  );
}

export default Navbar;
