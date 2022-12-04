import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

import "../styles/login.css";

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  InputGroup,
  InputRightElement,
  Button,
} from '@chakra-ui/react'

const Registration = () => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState({password: "", match: ""});
  const [show, setShow] = useState({showPassword: false, showMatch: false});
  const [matchPassword, setMatchPassword] = useState("");
  const [usernameError, setUsernameError] = useState("Username must be atleast 3 characters.");

  const navigate = useNavigate();

  const trySetUsername = (username) => {
    axios.get(`http://localhost:5000/auth/isUsernameAvailable?username=${username}`).then(response => {
        if(username.length < 3 && username.length > 15)
        {
          setUsername("");
          setUsernameError("Username must be between 3 and 15 characters");
        }
        else if (!response.data.result)
        {
          setUsername("");
          setUsernameError("Username is already taken.");
        }
        else
        {
          setUsername(username);
          setUsernameError("");
        }
      })
  }


  const tryRegister = () => {
    axios.post("http://localhost:5000/auth/register", { username: username, password: password.password }, { credentials: "include" }).then((response) => {
      console.log("Registration status code: " + response.status);
      if (response.ok)
      {
        console.log(response);
        navigate('/Login');
      }
      else
        console.log(response);
    }).catch(function (error) {
      console.log("Error Status " + error.response.status + ":");
      if (error.response) {
        console.log(error.response.data);
      } else if (error.request) {
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
    });
  }

  const passwordMismatch = password.password !== password.match;
  const passwordTooSmall = (password.password.length < 5)

  const isInvalid = (passwordMismatch || passwordTooSmall || usernameError)

  return (
    <div className="main">
      <div className="title">
        REGISTER
      </div>
      <div className="content">

        <p/>

        <FormControl className="content" isInvalid={isInvalid}>

          <FormLabel>Username</FormLabel>
          <Input type='text' isRequired={true} placeholder="Username" onChange={(e) => {trySetUsername(e.target.value)}} />
          {usernameError ? 
            <FormErrorMessage color="red">{usernameError}</FormErrorMessage>  : <FormHelperText><br/></FormHelperText>
          }
          
          <FormHelperText><br/></FormHelperText>

          <FormLabel>Password</FormLabel>
          <InputGroup size='md'>
            <Input
              pr='4.5rem'
              type={show.showPassword ? 'text' : 'password'}
              isRequired={true}
              onChange={(e) => {setPassword({password: e.target.value, match: password.match})}}
              placeholder='Password'
            />
            <InputRightElement width='4.5rem'>
              <Button h='1.75rem' size='sm' onClick={() => {setShow({showPassword: !show.showPassword})}}>
                {show.showPassword ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
          {passwordTooSmall ? 
            <FormErrorMessage color="red">Password must be atleast 5 characters.</FormErrorMessage> : <FormHelperText><br/></FormHelperText>
          }

          <FormHelperText><br/></FormHelperText>

          <FormLabel>Retype Password</FormLabel>
          <InputGroup size='md'>
            <Input
              pr='4.5rem'
              type={show.showMatch ? 'text' : 'password'}
              isRequired={true}
              onChange={(e) => {setPassword({password: password.password, match: e.target.value})}}
              placeholder='Password'
            />
            <InputRightElement width='4.5rem'>
              <Button h='1.75rem' size='sm' onClick={() => {setShow({showMatch: !show.showMatch})}}>
                {show.showMatch ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
          {passwordMismatch ? 
            <FormErrorMessage color="red">Password does not match.</FormErrorMessage> : <FormHelperText><br/></FormHelperText>
          }

          <Button
            mt={50}
            type='submit'
            onClick={(isInvalid) ? ()=>{} : ()=>{tryRegister()}}
          >
            Submit
          </Button>
        </FormControl>
      </div>

      <p/>

			<Link to="/login"> Already have an account? Login here!</Link>
    </div>
  );
}

export default Registration;