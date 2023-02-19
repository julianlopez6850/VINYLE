import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom";
import { authInstance } from "../helpers/axiosInstance"

import "../styles/page.css";

import {
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useToast,
} from '@chakra-ui/react'

const Login = () => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [request, setRequest] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const toast = useToast();

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

  // this function is called when the user presses the LOGIN button.
  const tryLogin = () => {
    // send username and password combo to backend...
    authInstance.post(`${process.env.REACT_APP_API_URL}/auth/login`, { username: username, password: password}).then(() => {
      setRequest(true);
    }).catch(function (error) { // catch any errors.
      if (error.response) {
        setErrorMessage(error.response.data.error);
      } else if (error.request) {
        setErrorMessage('There was an error processing the request... Try again later');
      } else {
        setErrorMessage('Error: ', error.message);
      }
      toast.close(' ');
      setRequest(true);
      setError(true);
    });
  }

  useEffect(() => {
    if(request && !error) {
      // if login is successful, nagivate to the main page.
      setTimeout(() => navigate('/'), 1500);
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
        tryLogin();
      }
    };

    document.addEventListener('keydown', keyDownHandler);

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, [ username, password ]);

  return (
    <div className="page">
      <div className="title">
        LOGIN
      </div>
      <div className="content">

        <p/>

        <FormControl className="content" style={{width:"300px"}}>

          <FormLabel>Username</FormLabel>
          <Input
            type='text'
            isRequired={true}
            placeholder="Username"
            onChange={(e) => {setUsername(e.target.value)}}
            autoFocus
          />
          
          <FormHelperText><br/></FormHelperText>

          <FormLabel>Password</FormLabel>
          <InputGroup size='md'>
            <Input
              pr='4.5rem'
              type={show ? 'text' : 'password'}
              isRequired={true}
              onChange={(e) => {setPassword(e.target.value)}}
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
                onClick={() => {setShow(!show)}}
              >
                {show ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>

          <FormHelperText><br/></FormHelperText>

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
            onClick={() => {tryLogin()}}
          >
            LOGIN
          </Button>
        </FormControl>
      </div>

      <p/>

      <Link to="/registration" style={{textDecoration:"underline"}} onClick={() => {toast.close(' ')}}> Don't have an account? Register here! </Link>

      
      {/* LOGIN TOAST NOTIFICATIONS */}
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
              description: `You are now logged in as ${username}.`,
              status: 'success',
              duration: 2000,
              isClosable: false
            })))
      }
    </div>
  );
}

export default Login;