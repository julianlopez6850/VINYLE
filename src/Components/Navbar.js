import React, { useState, useEffect } from "react";
import "../styles/navbar.css";
import { Link, useLocation } from "react-router-dom";
import { instance } from "../Helpers/axiosInstance"

import {
	Button
} from '@chakra-ui/react'

function Navbar() {

  const location = useLocation();
	const [loggedIn, setLoggedIn] = useState(false);
	const [username, setUsername] = useState("");

	useEffect(() => {
		instance.get("http://localhost:5000/auth/profile").then((response) => {
			console.log(response);
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

	useEffect(() => {
		console.log(loggedIn);
	}, [loggedIn])

	return (
		<div className="navbar">
			<div className="navbar-content">
				<div className="content-left">
          ...
				</div>
				<div className="content-middle">
					<div className="navbar-button">
						<Link to="/"> VINYLE </Link>
					</div>
        </div>
				<div className="content-right">
					<div className="navbar-button">
							<Button
								bgColor={"transparent"}
								_hover={{
									background: "transparent",
									color: "blue.200",
								}}
								_active={{
									background: "transparent",
									color: "blue.400",
								}}
							>
								{loggedIn ? 
									username :
									<Link to="/login">
										Login
									</Link>
								}
							</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Navbar;
