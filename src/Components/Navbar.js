import React, { useState, useEffect } from "react";
import "../styles/navbar.css";
import { Link, useLocation } from "react-router-dom";
import { instance } from "../Helpers/axiosInstance";
import axios from "axios";

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
	IconButton
} from '@chakra-ui/react'

import {
	HamburgerIcon,
	SettingsIcon
} from '@chakra-ui/icons'

function Navbar() {

  const location = useLocation();
	const [loggedIn, setLoggedIn] = useState(false);
	const [username, setUsername] = useState("");

	// when the url changes...
	useEffect(() => {
		instance.get("http://localhost:5000/auth/profile").then((response) => {
			console.log(response.data);
			setLoggedIn(true);
			setUsername(response.data.username)
		}).catch(function(error) {
			setLoggedIn(false);
      if(error.response)
			  console.log(error.response.data);
      else
        console.log({ error: "Error logging in" });
		});
	}, [location])

	// this function will handle  logging out the user.
	const logout = async (e) => {
		e.preventDefault();
		if(loggedIn)
		{
			setLoggedIn(false)
			await instance.post('http://localhost:5000/auth/logout').then((respones) => {
				console.log("User logged out.");
			}).catch(function(error) {
				console.log(error);
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
							>
								How To Play
							</MenuItem>

							<MenuDivider/>

							<MenuItem
								value='stats'
								bgColor="gray.900"
								_hover={{ bgColor: "gray.600" }}
							>
								Classic
							</MenuItem>
							<MenuItem
								value='logout'
								bgColor="gray.900"
								_hover={{ bgColor: "gray.600" }}
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
						<Link
							to="/"
							style={{
								height:"inherit",
								padding:"0px 10px 0px 10px"
							}}
						>
							VINYLE
						</Link>
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
								>
									History
								</MenuItem>
								<MenuItem
									value='stats'
									bgColor="gray.900"
									_hover={{ bgColor: "gray.600" }}
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
			</div>
		</div>
	);
}

export default Navbar;
