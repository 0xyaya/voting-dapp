import { useState, useEffect } from 'react';
import useEth from '../contexts/EthContext/useEth';
import Button from '../components/UI/Button';
import ErrorModal from '../components/UI/ErrorModal';
import NoticeNoArtifact from '../components/Notice/NoticeNoArtifact';
import NoticeWrongNetwork from '../components/Notice/NoticeWrongNetwork';

const Admin = () => {
  const {
    state: { artifact, contract, accounts, status }
  } = useEth();
  const [voter, setVoter] = useState('');
  const [error, setError] = useState();
  const [owner, setOwner] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const checkOwner = async () => {
      if (contract) {
        const ownerAddr = await contract.methods.owner().call();
        if (accounts[0]===ownerAddr) {
          setOwner(true);
        } else {
          setOwner(false);
        }
      }
    }
    checkOwner();
  }, [contract, accounts]);

  useEffect(() => {
    const fetchWinner = async () => {
      if (contract && status==='VotesTallied' && !winner) {
        if (!owner) {
          setError({
            title: 'Not Admin',
            message: 'Something weird happend, please comeback later'
          })
        } else {
          const winnerProposal = await contract.methods.winningProposalID.call();
          setWinner(winnerProposal);
        } 
      };
    }
    fetchWinner();
  }, [contract]);

  const addVoterHandler = async () => {
    if (!owner) {
      setError({
        title: 'Not Admin',
        message: 'You are not authorised'
      })
    } else {
      await contract.methods.addVoter(voter).send({ from: accounts[0] });
    }
    setVoter('');
  };

  const voterHandler = (event) => {
    if (!owner) {
      setError({
        title: 'Not Admin',
        message: 'You are not authorised'
      })
    } else {
      setVoter(event.target.value);
    }
  };

  const startRegistrationHandler = async () => {
    if (status !== 'RegisteringVoters') {
      setError({
        title: 'Bad Status',
        message: 'You cannot do that now'
      });
    } else if (!owner) {
      setError({
        title: 'Not Admin',
        message: 'You are not authorised'
      })
    } else {
      await contract.methods.startProposalsRegistering().send({ from: accounts[0] });
    }
  };

  const endRegistrationHandler = async () => {
    if (status !== 'ProposalsRegistrationStarted') {
      setError({
        title: 'Bad Status',
        message: 'You cannot do that now'
      });
    } else if (!owner) {
      setError({
        title: 'Not Admin',
        message: 'You are not authorised'
      })
    } else {
      await contract.methods.endProposalsRegistering().send({ from: accounts[0] });
    }
  };

  const startVotingHandler = async () => {
    if (status !== 'ProposalsRegistrationEnded') {
      setError({
        title: 'Bad Status',
        message: 'You cannot do that now'
      });
    } else if (!owner) {
      setError({
        title: 'Not Admin',
        message: 'You are not authorised'
      })
    } else {
      await contract.methods.startVotingSession().send({ from: accounts[0] });
    }
  };

  const endVotingHandler = async () => {
    if (status !== 'VotingSessionStarted') {
      setError({
        title: 'Bad Status',
        message: 'You cannot do that now'
      });
    } else if (!owner) {
      setError({
        title: 'Not Admin',
        message: 'You are not authorised'
      })
    } else {
      await contract.methods.endVotingSession().send({ from: accounts[0] });
    }
  };

  const tallyVotesHandler = async () => {
    if (status !== 'VotingSessionEnded') {
      setError({
        title: 'Bad Status',
        message: 'You cannot do that now'
      });
    } else if (!owner) {
      setError({
        title: 'Not Admin',
        message: 'You are not authorised'
      })
    } else {
      await contract.methods.tallyVotes().send({ from: accounts[0] });
    }
  };

  const errorHandler = () => {
    setError(null);
  };

  const admin = (
    <>
    {error && <ErrorModal title={error.title} message={error.message} onClick={errorHandler} />}
        <div className="mt-6 mx-auto w-2/3">
          <div className="flex flex-row justify-between text-center">
            <div className="flex flex-col lg:flex-row items-center lg:space-x-4 text-slate-700 align">
              <label>Workflow Status:</label>
              <span className="text-sky-800 text-xl border border-sky-800 rounded-lg p-2 lg:mt-0">
                {status}
              </span>
            </div>
          </div>
          {status==="RegisteringVoters" && (
            <>
            <input className="rounded-md h-8 p-2 my-2 border border-sky-800" value={voter} onInput={voterHandler} />
            <Button label="Add Voter" onClick={addVoterHandler} />
            <div className="space-x-4">
            <Button label="Start Proposal" onClick={startRegistrationHandler} />
            </div>
            </>
          )}
          {status==="ProposalsRegistrationStarted" && (
            <div className="space-x-4">
              <Button label="End Proposal" onClick={endRegistrationHandler} />
            </div>
          )}
          {status==="ProposalsRegistrationEnded" && (
            <div className="space-x-4">
              <Button label="Start Voting" onClick={startVotingHandler} />
            </div>
          )}
          {status==="VotingSessionStarted" && (
            <div className="space-x-4">
              <Button label="End Voting" onClick={endVotingHandler} />
            </div>
          )}
          {status==="VotingSessionEnded" && (
            <div className="space-x-4">
              <Button label="Tally Vote" onClick={tallyVotesHandler} />
            </div>
          )}
          {status==="VotesTallied" && (
            <>
            <span>The election winner is: {winner}</span>
            </>
          )}
        </div>    
    </>
  )

  return (
    <div className="flex flex-col mx-auto bg-background bg-cover min-h-screen">
      {!artifact ? <NoticeNoArtifact /> : !contract ? <NoticeWrongNetwork /> : admin}
    </div>
  );
};

export default Admin;
