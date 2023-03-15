import { useState, useEffect } from 'react';
import useEth from '../contexts/EthContext/useEth';
import Button from '../components/UI/Button';
import ErrorModal from '../components/UI/ErrorModal';

const Admin = () => {
  const {
    state: { contract, web3, accounts, status }
  } = useEth();
  const [voter, setVoter] = useState('');
  const [error, setError] = useState();

  const addVoterHandler = async () => {
    await contract.methods.addVoter(voter).send({ from: accounts[0] });
  };

  const voterHandler = (event) => {
    setVoter(event.target.value);
  };

  const startRegistrationHandler = async () => {
    await contract.methods.startProposalsRegistering().send({ from: accounts[0] });
  };

  const endRegistrationHandler = async () => {
    if (status !== 'ProposalsRegistrationStarted') {
      setError({
        title: 'Bad Status',
        message: 'You cannot do that now'
      });
    } else {
      await contract.methods.endProposalsRegistering().send({ from: accounts[0] });
    }
  };

  const startVotingHandler = async () => {
    if (status !== 'ProposalsRegistrationEnd') {
      setError({
        title: 'Bad Status',
        message: 'You cannot do that now'
      });
    } else {
      await contract.methods.startVotingSession().send({ from: accounts[0] });
    }
  };

  const endVotingHandler = async () => {
    await contract.methods.endVotingSession().send({ from: accounts[0] });
  };

  const tallyVotesHandler = async () => {
    await contract.methods.tallyVotes().send({ from: accounts[0] });
  };

  const errorHandler = () => {
    setError(null);
  };

  return (
    <div>
      {error && <ErrorModal title={error.title} message={error.message} onClick={errorHandler} />}
      <h1>Hello Admin!</h1>
      <input className="border-black border" onChange={voterHandler} />
      <Button label="Add Voter" onClick={addVoterHandler} />
      <Button label="Start Proposal" onClick={startRegistrationHandler} />
      <Button label="End Proposal" onClick={endRegistrationHandler} />
      <Button label="Start Voting" onClick={startVotingHandler} />
      <Button label="End Voting" onClick={endVotingHandler} />
      <Button label="Tally Vote" onClick={tallyVotesHandler} />
      <div>
        Workflow Status:{' '}
        <span className="text-slate-700 text-xl border border-slate-700 rounded-lg p-2 my-2">
          {status}
        </span>
      </div>
    </div>
  );
};

export default Admin;
