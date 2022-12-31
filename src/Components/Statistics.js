import { instance } from "../Helpers/axiosInstance";

import {
	Button,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	Progress,
  Stat
} from '@chakra-ui/react'

export const getStats = async (e, loggedIn, username, mode, setStats, onOpen) => {
  e.preventDefault();
  if(loggedIn)
  {
    await instance.get(`http://localhost:5000/games/user?username=${username}${(mode) ? `&mode=${mode}` : ``}`).then(async (response) => {
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

const Statistics = (props) => {

  return (
    <div>
      <Modal
      isCentered
      onClose={props.onClose}
      isOpen={props.isOpen}
      motionPreset='slideInBottom'
      >
        <ModalOverlay />
        <ModalContent 
        color="white"
        bgColor="gray.700">
          <ModalHeader style={{display:"flex", justifyContent:"center" }}>{props.mode ? `${props.mode} Mode` : ``}  Statistics</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div style={{display:"flex", flexDirection:"row", justifyContent:"space-evenly", textAlign:"center"}}>
              <div style={{display:"flex", flexDirection:"column", minWidth:65, width:"fit-content", alignItems:"center"}}>
                <div style={{fontSize:36, fontWeight:"bold"}}>{props.stats.numGames}</div>
                <div style={{width:65, marginTop:-10}}>Games Played</div>
              </div>
              <div style={{display:"flex", flexDirection:"column", minWidth:65, width:"fit-content", alignItems:"center"}}>
                <div style={{fontSize:36, fontWeight:"bold"}}>{props.stats.numWins}</div>
                <div style={{width:65, marginTop:-10}}>Wins</div>
              </div>
              <div style={{display:"flex", flexDirection:"column", minWidth:65, width:"fit-content", alignItems:"center"}}>
                <div style={{fontSize:36, fontWeight:"bold"}}>{props.stats.numLosses}</div>
                <div style={{width:65, marginTop:-10}}>Losses</div>
              </div>
              <div style={{display:"flex", flexDirection:"column", minWidth:65, width:"fit-content", alignItems:"center"}}>
                <div style={{fontSize:36, fontWeight:"bold"}}>{props.stats.winPercent}</div>
                <div style={{width:65, marginTop:-10}}>Win %</div>
              </div>
              <div style={{display:"flex", flexDirection:"column", minWidth:65, width:"fit-content", alignItems:"center"}}>
                <div style={{fontSize:36, fontWeight:"bold"}}>{props.stats.avgGuessesPerWin}</div>
                <div style={{width:65, marginTop:-10}}>Avg Guesses</div>
              </div>
            </div>

            <br/>
            <strong style={{ display:"flex", justifyContent:"center" }}>Guess Distribution:</strong>
            {(props.stats.guessDistribution) ? props.stats.guessDistribution.map((item, index) => {
              return (
              <>
                {index + 1} Guess Win <Progress style={{ zIndex:"-1" }} size='lg' colorScheme='green' bgColor="gray.700" value={Math.max((item / props.stats.mostFrequent) * 100, 5)} />
                <div style={{ margin:"-21px 0px 0px 5px", textAlign:"left" }}>{item}</div>
              </>
            )}) : ""}
            Loss: <Progress style={{zIndex:"-1"}} size='lg' colorScheme='red' bgColor="gray.700" value={Math.max(props.stats.numLosses / props.stats.mostFrequent * 100, 5)} />
            <div style={{ margin:"-21px 0px 0px 5px", textAlign:"left" }}>{props.stats.numLosses}</div>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={props.onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default Statistics;