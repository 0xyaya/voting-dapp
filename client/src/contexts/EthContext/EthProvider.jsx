import React, { useReducer, useCallback, useEffect } from 'react';
import Web3 from 'web3';
import EthContext from './EthContext';
import { reducer, actions, initialState } from './state';

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const init = useCallback(async (artifact) => {
    if (artifact) {
      const web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');
      const accounts = await web3.eth.requestAccounts();
      const networkID = await web3.eth.net.getId();
      const { abi } = artifact;
      let address, contract, status;
      try {
        address = artifact.networks[networkID].address;
        contract = new web3.eth.Contract(abi, address);
        status = await contract.methods.workflowStatus().call({ from: accounts[0] });
        await contract.events
          .WorkflowStatusChange({ fromBlock: 'earliest' })
          .on('data', (event) => {
            let newStatus = event.returnValues.newStatus;
            dispatch({
              type: actions.updateStatus,
              data: { ...state, status: workflowStatusToString(newStatus) }
            });
          });
      } catch (err) {
        console.error(err);
      }
      dispatch({
        type: actions.init,
        data: {
          artifact,
          web3,
          accounts,
          networkID,
          contract,
          status: workflowStatusToString(status)
        }
      });
    }
  }, []);

  const workflowStatusToString = (status) => {
    switch (status) {
      case '0':
        return 'RegisteringVoters';
      case '1':
        return 'ProposalsRegistrationStarted';
      case '2':
        return 'ProposalsRegistrationEnded';
      case '3':
        return 'VotingSessionStarted';
      case '4': 
        return 'VotingSessionEnded';
      case '5':
        return 'VotesTallied';
    }
  };

  useEffect(() => {
    const tryInit = async () => {
      try {
        const artifact = require('../../contracts/Voting.json');
        init(artifact);
      } catch (err) {
        console.error(err);
      }
    };

    tryInit();
  }, [init]);

  useEffect(() => {
    const events = ['chainChanged', 'accountsChanged'];
    const handleChange = () => {
      init(state.artifact);
    };

    events.forEach((e) => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach((e) => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, state.artifact]);

  return (
    <EthContext.Provider
      value={{
        state,
        dispatch
      }}>
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
