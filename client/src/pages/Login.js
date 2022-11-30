import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

import "../styles/login.css";

import {
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  InputGroup,
  InputRightElement,
  Button,
} from '@chakra-ui/react'

const Login = () => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const navigate = useNavigate();


  const tryLogin = () => {
    axios.post("http://localhost:5000/auth/login", { username: username, password: password}).then((response) => {
      console.log(response.data);
      console.log({ username: username, password: password });
      if (response.data.success)
        navigate('/');
    })
  }

  return (
    <div className="main">
      <div className="title">
        LOGIN
      </div>
      <div className="content">

        <p/>

        <FormControl className="content">

          <FormLabel>Username</FormLabel>
          <Input type='text' isRequired={true} placeholder="Username" onChange={(e) => {setUsername(e.target.value)}} />
          
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
              <Button h='1.75rem' size='sm' onClick={() => {setShow(!show)}}>
                {show ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>

          <FormHelperText><br/></FormHelperText>

          <Button
            mt={50}
            type='submit'
            onClick={() => {tryLogin()}}
          >
            Submit
          </Button>
        </FormControl>
      </div>

      <p/>

			<Link to="/registration"> Don't have an account? Register here!</Link>
    </div>
  );
}

export default Login;