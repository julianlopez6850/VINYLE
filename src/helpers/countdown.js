import { Box, HStack, Button } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Countdown = (props) => {
  const [hours, setHours] = useState();
  const [mins, setMins] = useState();
  const [secs, setSecs] = useState();
  const [target, setTarget] = useState();
  const [playNext, setPlayNext] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const dateArr = props.date.split('-');
    console.log(dateArr[2] + '-' + dateArr[0] + '-' + dateArr[1]);
    var d = new Date(dateArr[2] + '-' + dateArr[0] + '-' + (parseInt(dateArr[1]) + 1));
    console.log(d);
    d.setHours(24, 0, 0);
    console.log(d);
    setTarget(new Date(d));
  }, [])

  useEffect(() => {
    console.log(target)
    if(target) {
      const interval = setInterval(() => {
        const now = new Date();
        const difference = target.getTime() - now.getTime();

        const d = Math.floor(difference / (1000 * 60 *60 * 24));

        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setHours(h);

        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        setMins(m);

        const s = Math.floor((difference % (1000 * 60)) / (1000));
        setSecs(s);

        if(h <= 0 && m <= 0 && s < 0) {
          setHours(0);
          setMins(0);
          setSecs(0);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [target])

  useEffect(() => {
    if(hours <= 0 && mins <= 0 && secs <= 0) {
      if(props.isOpen) {
        setPlayNext(true);
      }
    }
  }, [hours, mins, secs])

  const doPlayNext = () => {
    var d = new Date();
    d.setHours(24, 0, 0);
    console.log(d);
    setTarget(new Date(Date.parse(d)));
    setTimeout(navigate("/"), 1000);
  }

  return(
    <Box width="200px">
      <HStack justify="center">
          <span>{(hours && hours < 10) ? "0" : ""}{hours ? hours : "00"}</span>
          <span>:</span>
          <span>{(mins && mins < 10) ? "0" : ""}{mins ? mins : "00"}</span>
          <span>:</span>
          <span>{(secs && secs < 10)  ? "0" : ""}{secs ? secs : "00"}</span>
      </HStack>
      {(playNext) && 
        <Button
          w="175px"
          m="5px 0px 10px 0px"
          color="white"
          bgColor="gray.700"
          border="1px solid black"
          _hover={{
            border:"1px solid var(--gray-600)"
          }}
          _active={{}}
          onClick = {() => {doPlayNext()}}
        >
          Play New Classic
        </Button>
      }
    </Box>
  )
}

export default Countdown;