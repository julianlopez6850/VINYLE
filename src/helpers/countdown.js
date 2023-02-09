import { Box, HStack, VStack } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Countdown = (props) => {
  const [hours, setHours] = useState();
  const [mins, setMins] = useState();
  const [secs, setSecs] = useState();
  const [target, setTarget] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    var d = new Date();
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
        var d = new Date();
        d.setHours(24, 0, 0);
        console.log(d);
        setTarget(new Date(Date.parse(d)));
        setTimeout(navigate("/"), 1000);
      }
    }
  }, [hours, mins, secs])

  return(
    <Box width="200px">
      <HStack justify="center">
          <span>{(hours && hours < 10) ? "0" : ""}{hours ? hours : "00"}</span>
          <span>:</span>
          <span>{(mins && mins < 10) ? "0" : ""}{mins ? mins : "00"}</span>
          <span>:</span>
          <span>{(secs && secs < 10)  ? "0" : ""}{secs ? secs : "00"}</span>
      </HStack>
    </Box>
  )
}

export default Countdown;