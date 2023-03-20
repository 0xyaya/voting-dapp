import { useState, useEffect } from 'react';
import useEth from '../contexts/EthContext/useEth';
import Button from '../components/UI/Button';
import ErrorModal from '../components/UI/ErrorModal';
import SuccessModal from '../components/UI/SuccessModal';

const Admin = () => {
  const {
    state: { contract, accounts, status, winner }
  } = useEth();
  const [voter, setVoter] = useState('');
  const [error, setError] = useState();
  const [owner, setOwner] = useState(false);
  const [success, setSuccess] = useState();

  useEffect(() => {
    const checkOwner = async () => {
      if (contract) {
        const ownerAddr = await contract.methods.owner().call();
        if (accounts[0] === ownerAddr) {
          setOwner(true);
        } else {
          setOwner(false);
        }
      }
    };
    checkOwner();
  }, [contract]);

  const addVoterHandler = async () => {
    if (!owner) {
      setError('You are not authorised');
    } else {
      await contract.methods.addVoter(voter).send({ from: accounts[0] });
      setSuccess(`${voter} has been successfully added`);
      setVoter('');
    }
  };

  const voterHandler = (event) => {
    if (!owner) {
      setError('You are not authorised');
    } else {
      setVoter(event.target.value);
    }
  };

  const startRegistrationHandler = async () => {
    if (status !== 'RegisteringVoters') {
      setError('RegisteringVoters status required');
    } else if (!owner) {
      setError('You are not authorised');
    } else {
      await contract.methods.startProposalsRegistering().send({ from: accounts[0] });
      setSuccess('Proposal Registration has started!');
    }
  };

  const endRegistrationHandler = async () => {
    if (status !== 'ProposalsRegistrationStarted') {
      setError('ProposalsRegistrationStarted status required');
    } else if (!owner) {
      setError('You are not authorised');
    } else {
      await contract.methods.endProposalsRegistering().send({ from: accounts[0] });
      setSuccess('Proposal Registration has ended!');
    }
  };

  const startVotingHandler = async () => {
    if (status !== 'ProposalsRegistrationEnded') {
      setError('ProposalsRegistrationEnded');
    } else if (!owner) {
      setError('You are not authorised');
    } else {
      if (contract) await contract.methods.startVotingSession().send({ from: accounts[0] });
      setSuccess('Voting Session has begun!');
    }
  };

  const endVotingHandler = async () => {
    if (status !== 'VotingSessionStarted') {
      setError('VotingSessionStarted status required');
    } else if (!owner) {
      setError('You are not authorised');
    } else {
      await contract.methods.endVotingSession().send({ from: accounts[0] });
      setSuccess('Voting Session has ended!');
    }
  };

  const tallyVotesHandler = async () => {
    if (status !== 'VotingSessionEnded') {
      setError('VotingSessionEnded status required');
    } else if (!owner) {
      setError('You are not authorised');
    } else {
      if (contract) {
        await contract.methods.tallyVotes().send({ from: accounts[0] });
        setSuccess('Votes have been tallied!');
      }
    }
  };

  const errorHandler = () => {
    setError(null);
  };

  const successHandler = () => {
    setSuccess(null);
  };

  const admin = (
    <>
      {error && <ErrorModal title={error.title} message={error.message} onClick={errorHandler} />}
      {success && <SuccessModal message={success} onClick={successHandler} />}
      <div className="mt-6 mx-auto w-2/3">
        <div className="flex flex-row justify-between text-center">
          <div className="flex flex-col lg:flex-row items-center lg:space-x-4 text-slate-700 align">
            <label>Workflow Status:</label>
            <span className="text-sky-800 text-xl border border-sky-800 rounded-lg p-2 lg:mt-0">
              {status}
            </span>
          </div>
        </div>
        {status === 'RegisteringVoters' && (
          <>
            <input
              className="rounded-md h-8 p-2 my-2 border border-sky-800"
              value={voter}
              onInput={voterHandler}
            />
            <Button label="Add Voter" onClick={addVoterHandler} />
            <div className="space-x-4">
              <Button label="Start Proposal" onClick={startRegistrationHandler} />
            </div>
          </>
        )}
        {status === 'ProposalsRegistrationStarted' && (
          <div className="space-x-4">
            <Button label="End Proposal" onClick={endRegistrationHandler} />
          </div>
        )}
        {status === 'ProposalsRegistrationEnded' && (
          <div className="space-x-4">
            <Button label="Start Voting" onClick={startVotingHandler} />
          </div>
        )}
        {status === 'VotingSessionStarted' && (
          <div className="space-x-4">
            <Button label="End Voting" onClick={endVotingHandler} />
          </div>
        )}
        {status === 'VotingSessionEnded' && (
          <div className="space-x-4">
            <Button label="Tally Vote" onClick={tallyVotesHandler} />
          </div>
        )}
        {status === 'VotesTallied' && (
          <>
            <div className="flex flex-col lg:flex-row items-center lg:space-x-4 text-slate-700 align">
              <label>The election winner is the proposal ID: </label>
              <span className="text-sky-800 text-xl border border-sky-800 rounded-lg p-1 lg:mt-0">
                {winner}
              </span>
            </div>
          </>
        )}
      </div>
    </>
  );

  return <div className="flex flex-col mx-auto bg-background bg-cover min-h-screen">{admin}</div>;
};

export default Admin;
