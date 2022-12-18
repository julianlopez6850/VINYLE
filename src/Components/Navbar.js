import React, { useState, useEffect } from "react";
import "../styles/navbar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
	IconButton,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	useDisclosure,
	Progress
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
	const { isOpen, onOpen, onClose } = useDisclosure();

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
			await instance.post('http://localhost:5000/auth/logout').then((response) => {
				console.log("User logged out.");
			}).catch(function(error) {
				console.log(error);
			})
		}
	}

	const getStats = async (e) => {
		e.preventDefault();
		if(loggedIn)
		{
			await instance.get(`http://localhost:5000/games/user/mode?username=${username}&mode=${mode}`).then(async (response) => {
				if(response.data.error) {
					console.log(response.data.error);
				} else {
					var numGames = response.data.games.length;
					var numWins = 0;
					var numGuesses = 0;
					var numGuessDistribution = [0,0,0,0,0,0]
					for(var i = 0; i < numGames; i++) {
						if(response.data.games[i].win === 1) {
							numWins++;
							numGuessDistribution[response.data.games[i].numGuesses - 1]++;
						}
					}
					var mostFrequent = 0;
					numGuessDistribution.forEach((item, index) => {
						numGuesses += item * (index + 1);
						if(item > mostFrequent)
							mostFrequent = item;
					})
					setStats({ numGames: numGames,
						numWins: numWins,
						numLosses: numGames - numWins,
						winPercent: parseFloat((numWins / numGames * 100).toFixed()),
						guessDistribution: numGuessDistribution,
						avgGuessesPerWin: parseFloat((numGuesses / numWins).toFixed(2)),
						mostFrequent: mostFrequent
					});
				}
			}).catch(function(error) {
				console.log(error);
			})
		}
		onOpen();
	}

	useEffect(() => {
		console.log(stats);
	}, [stats])

	useEffect(() => {
		if(mode === "Classic")
			navigate('/');
		else if(mode === "Infinite")
			navigate('/infinite');
	}, [mode])
      
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
								onClick={() => {setMode("Classic")}}
							>
								Classic
							</MenuItem>
							<MenuItem
								value='logout'
								bgColor="gray.900"
								_hover={{ bgColor: "gray.600" }}
								onClick={() => {setMode("Infinite")}}
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
									onClick={(e) => getStats(e)}
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
				
				{/* Statistics Popup */}
				<Modal
					isCentered
					onClose={onClose}
					isOpen={isOpen}
					motionPreset='slideInBottom'
				>
					<ModalOverlay />
					<ModalContent 
					color="white"
					bgColor="gray.700">
						<ModalHeader style={{display:"flex", justifyContent:"center" }}>{mode} Mode Statistics</ModalHeader>
						<ModalCloseButton />
						<ModalBody>
							<div style={{display:"flex", flexDirection:"row", justifyContent:"space-evenly", textAlign:"center"}}>
								<div style={{display:"flex", flexDirection:"column", minWidth:65, width:"fit-content", alignItems:"center"}}>
									<div style={{fontSize:36, fontWeight:"bold"}}>{stats.numGames}</div>
									<div style={{width:65, marginTop:-10}}>Games Played</div>
								</div>
								<div style={{display:"flex", flexDirection:"column", minWidth:65, width:"fit-content", alignItems:"center"}}>
									<div style={{fontSize:36, fontWeight:"bold"}}>{stats.numWins}</div>
									<div style={{width:65, marginTop:-10}}>Wins</div>
								</div>
								<div style={{display:"flex", flexDirection:"column", minWidth:65, width:"fit-content", alignItems:"center"}}>
									<div style={{fontSize:36, fontWeight:"bold"}}>{stats.numLosses}</div>
									<div style={{width:65, marginTop:-10}}>Losses</div>
								</div>
								<div style={{display:"flex", flexDirection:"column", minWidth:65, width:"fit-content", alignItems:"center"}}>
									<div style={{fontSize:36, fontWeight:"bold"}}>{stats.winPercent}</div>
									<div style={{width:65, marginTop:-10}}>Win %</div>
								</div>
								<div style={{display:"flex", flexDirection:"column", minWidth:65, width:"fit-content", alignItems:"center"}}>
									<div style={{fontSize:36, fontWeight:"bold"}}>{stats.avgGuessesPerWin}</div>
									<div style={{width:65, marginTop:-10}}>Avg Guesses</div>
								</div>
							</div>

							<br/>
							<strong style={{ display:"flex", justifyContent:"center" }}>Guess Distribution:</strong>
							{(stats.guessDistribution) ? stats.guessDistribution.map((item, index) => {
								return (
								<>
									{index + 1} Guess Win <Progress style={{ zIndex:"-1" }} size='lg' colorScheme='green' bgColor="gray.700" value={Math.max((item / stats.mostFrequent) * 100, 5)} />
									<div style={{ margin:"-21px 0px 0px 5px", textAlign:"left" }}>{item}</div>
								</>
							)}) : ""}
							Loss: <Progress style={{zIndex:"-1"}} size='lg' colorScheme='red' bgColor="gray.700" value={Math.max(stats.numLosses / stats.mostFrequent * 100, 5)} />
							<div style={{ margin:"-21px 0px 0px 5px", textAlign:"left" }}>{stats.numLosses}</div>
						</ModalBody>
						<ModalFooter>
							<Button colorScheme='blue' mr={3} onClick={onClose}>
								Close
							</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>
			</div>
		</div>
	);
}

export default Navbar;
