import React from "react";
import "../styles/navbar.css";
import { Link } from "react-router-dom";

function Navbar() {
	return (
		<div className="navbar">
			<div className="navbar-content">
				<div className="content-left">
          ...
				</div>
				<div className="content-middle">
					<div className="navbar-button">
						<Link to="/"> ALBUMLE </Link>
					</div>
        </div>
				<div className="content-right">
					<div className="navbar-button">
						<Link to="/login"> Login </Link>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Navbar;
