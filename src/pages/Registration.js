import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom";
import { authInstance } from "../helpers/axiosInstance"
import axios from 'axios';

import "../styles/page.css";

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useToast,
} from '@chakra-ui/react'

const Registration = () => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState({password: "", match: ""});
  const [matchPassword, setMatchPassword] = useState("");
  const [show, setShow] = useState({showPassword: false, showMatch: false});
  const [usernameError, setUsernameError] = useState("Username must be between 3 and 15 characters.");
  const [request, setRequest] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Make sure to follow all registration directions");

  const navigate = useNavigate();
  const toast = useToast();

  const passwordMismatch = password.password !== password.match;
  const passwordTooSmall = (password.password.length < 5)
  const isInvalid = (passwordMismatch || passwordTooSmall || (usernameError != ""))

  useEffect(() => {
    authInstance.get(`${process.env.REACT_APP_API_URL}/auth/profile`).then((response) => {
      navigate('/');
    }).catch(function (error) { // catch any errors.
      if (error.response) {
        console.log(error.response.data);
      } else {
        console.log(error.message);
      }
    });

    toast.closeAll();
  }, [])

  // this function will run when the username input is updated and check if the input is a valid username.
  const trySetUsername = (input) => {
    // check if the input is within 3 and 15 characters.
    if(input.length < 3 || input.length > 15) {
      setUsername("");
      setUsernameError("Username must be between 3 and 15 characters.");
      return;
    } else {
      setUsernameError("");
    }
    // check if the username is available.
    axios.get(`${process.env.REACT_APP_API_URL}/auth/isUsernameAvailable?username=${input}`).then(response => {
      if (!response.data.result) {
        setUsername("");
        setUsernameError("Username is already taken.");
      } else {
        setUsername(input);
        setUsernameError("");
      }
    })
  }

  // this function is called when the user pressed the REGISTER button.
  const tryRegister = () => {
    // post the username and password combination to the server, to be added to the users table.
    authInstance.post(`${process.env.REACT_APP_API_URL}/auth/register`, { username: username, password: password.password }).then(() => {
      setRequest(true);
    }).catch(function (error) { // catch any errors.
      console.log("An error occurred while trying to register...");
      if (error.response) {
        console.log(error.response.data);
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log('Error: ', error.message);
      }
      setErrorMessage('There was an error processing the request... Try again later');
      toast.close(' ');
      setRequest(true);
      setError(true);
    });
  }

  const handleError = () => {
    authInstance.post(`${process.env.REACT_APP_API_URL}/auth/register`).catch(function () { 
      setErrorMessage('Make sure to follow all registration directions');
      toast.close(' ');
      setRequest(true);
      setError(true);
    });
  }

  useEffect(() => {
    if(request && !error) {
      // registration is complete... navigate to the login page.
      setTimeout(() => navigate('/Login'), 1500);
      setRequest(false);
    } else if(error) {
      setRequest(false);
      setError(false);
    }
  }, [request])

  useEffect(() => {
    const keyDownHandler = event => {

      if (event.key === 'Enter') {
        event.preventDefault();
        tryRegister();
      }
    };

    document.addEventListener('keydown', keyDownHandler);

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, [ username, password, matchPassword ]);

  return (
    <div className="page">
      <div className="title">
        REGISTER
      </div>
      <div className="content">

        <p/>
        {/* Form for username input */}
        <FormControl className="content" isInvalid={usernameError} style={{width:"300px"}}>

          <FormLabel>Username</FormLabel>
          <Input
            type='text'
            isRequired={true}
            placeholder="Username"
            onChange={(e) => {trySetUsername(e.target.value)}}
            autoFocus
          />
          {usernameError ? 
            <FormErrorMessage>
              {usernameError}
            </FormErrorMessage>  : 
            <FormHelperText><br/></FormHelperText>
          }
          
          <FormHelperText><br/></FormHelperText>
        </FormControl>

        {/* Form for password & repeat password input */}
        <FormControl className="content" isInvalid={passwordMismatch || passwordTooSmall}  style={{width:"300px"}}>
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
              <Button 
                h='1.75rem'
                size='sm'
                bgColor="blue.500"
                color="white"
                _hover={{
                  bg: "blue.600",
                  color: "white"
                }}
                _active={{
                  bg: "blue.600",
                  color: "gray.200"
                }}
                onClick={() => {setShow({showPassword: !show.showPassword})}}
              >
                {show.showPassword ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
          {passwordTooSmall ? 
            <FormErrorMessage>
              Password must be atleast 5 characters.
            </FormErrorMessage> : 
            <FormHelperText><br/></FormHelperText>
          }

          <FormHelperText><br/></FormHelperText>

          <FormLabel>Repeat Password</FormLabel>
          <InputGroup size='md'>
            <Input
              pr='4.5rem'
              type={show.showMatch ? 'text' : 'password'}
              isRequired={true}
              onChange={(e) => {setPassword({password: password.password, match: e.target.value})}}
              placeholder='Password'
            />
            <InputRightElement width='4.5rem'>
              <Button 
                h='1.75rem'
                size='sm'
                bgColor="blue.500"
                color="white"
                _hover={{
                  bg: "blue.600",
                  color: "white"
                }}
                _active={{
                  bg: "blue.600",
                  color: "gray.200"
                }}
                onClick={() => {setShow({showMatch: !show.showMatch})}}
              >
                {show.showMatch ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
          {passwordMismatch ? 
            <FormErrorMessage>
              Password does not match.
            </FormErrorMessage> : 
            <FormHelperText><br/></FormHelperText>
          }

          <Button
            mt={50}
            type='submit'
            bgColor="blue.500"
            color="white"
            _hover={{
              bg: "blue.600",
              color: "white"
            }}
            _active={{
              bg: "blue.600",
              color: "gray.200"
            }}
            onClick={(isInvalid) ? 
              () => {
                handleError();
              } : 
              () => {
                tryRegister();
              }
            }
          >
            REGISTER
          </Button>
        </FormControl>
      </div>

      <p/>

      <Link to="/login" style={{textDecoration:"underline"}} onClick={() => {toast.close(' ')}}> Already have an account? Login here! </Link>

      {/* REGISTRATION TOAST NOTIFICATIONS */}
      {(request) &&
        ((error) ?
          ((!toast.isActive(' ')) &&
            toast({
              position: 'top',
              id: ' ',
              title: 'ERROR',
              description: errorMessage,
              status: 'error',
              duration: 5000,
              isClosable: false
            })) :
          ((!toast.isActive('')) &&
            toast({
              position: 'top',
              id: '',
              title: 'SUCCESS',
              description: `Welcome to VINYLE, ${username}.`,
              status: 'success',
              duration: 2000,
              isClosable: false
            })))
      }
    </div>
  );
}

export default Registration;