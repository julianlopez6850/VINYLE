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
} from '@chakra-ui/react'

export const getStats = async (e, loggedIn, username, mode, setStats, onOpen) => {
  e.preventDefault();
  if(loggedIn)
  {
    await instance.get(`http://localhost:5000/games/user/stats?username=${username}${(mode) ? `&mode=${mode}` : ``}`).then(async (response) => {
      if(response.data.game) {
        const data = response.data.game;
        setStats({ numGames: data.numGames,
          numWins: data.numWins,
          numLosses: data.numLosses,
          winPercent: data.winPercent,
          guessDistribution: data.guessDistribution,
          avgGuessesPerWin: data.avgGuessesPerWin,
          mostFrequent: data.mostFrequent
        });
      } else {
        console.log(response.data.message);
        setStats({ numGames: 0,
          numWins: 0,
          numLosses: 0,
          winPercent: 0,
          guessDistribution: [0, 0, 0, 0, 0, 0],
          avgGuessesPerWin: 0,
          mostFrequent: 1
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

            {/* Display progress bars and # of each item for guess distribution */}
            {(props.stats.guessDistribution) ? [...props.stats.guessDistribution, props.stats.numLosses].map((item, index) => {
              return (
                <div key={index}>
                  {(index===6) ? "Loss:" : (index + 1) + " Guess Win:"}
                  <Progress
                    style={{ zIndex:"-1" }}
                    size='lg'
                    colorScheme={(index===6) ? 'red' : 'green'}
                    bgColor="gray.700"
                    value={Math.max((item / props.stats.mostFrequent) * 100, 5)}
                  />
                  <div
                    style={{
                      margin:"-21px 0px 0px 5px",
                      textAlign:"left"
                    }}
                  >
                    {item}
                  </div>
                </div>
            )}) : ""}
            
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