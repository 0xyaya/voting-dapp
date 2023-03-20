import { useState, useEffect, useCallback } from 'react';
import useEth from '../contexts/EthContext/useEth';
import Button from '../components/UI/Button';
import ErrorModal from '../components/UI/ErrorModal';
import ProposalList from '../components/Proposal/ProposalList';
import NoticeNoArtifact from '../components/Notice/NoticeNoArtifact';
import NoticeWrongNetwork from '../components/Notice/NoticeWrongNetwork';

const Home = () => {
  const {
    state: { artifact, contract, accounts, status }
  } = useEth();
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposals, setProposals] = useState([]);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    const checkAccountRegistering = async () => {
      if (contract) {
        await contract.getPastEvents(
          'VoterRegistered',
          {
            fromBlock: 0,
            toBlock: 'latest'
          },
          (err, events) => {
            const addresses = events.map((event) => event.returnValues.voterAddress);
            if (addresses.filter((address) => address === accounts[0]).length > 0) {
              setRegistered(true);
            } else {
              setRegistered(false);
            }
          }
        );

        await contract.events.VoterRegistered({ fromBlock: 'earliest' }).on('data', (event) => {
          if (event.returnValues.voterAddress === accounts[0]) setRegistered(true);
        });
      }
    };
    checkAccountRegistering();
  }, [contract]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (contract) {
        const oldEvents = await contract.getPastEvents('ProposalRegistered', {
          fromBlock: 0,
          toBlock: 'latest'
        });
        const tmpProposals = [];
        for (let i = 1; i <= oldEvents.length; i++) {
          const proposal = await contract.methods.getOneProposal(i).call({ from: accounts[0] });
          tmpProposals.push({ ...proposal, id: i });
        }
        setProposals((props) => tmpProposals);

        await contract.events
          .ProposalRegistered({ fromBlock: 'earliest' })
          .on('data', async (event) => {
            const proposal = await contract.methods
              .getOneProposal(event.returnValues.proposalId)
              .call({ from: accounts[0] });

            updateProposalsHandler({ ...proposal, id: event.returnValues.proposalId });
          });
      }
    };

    fetchEvents();
  }, [contract]);

  const updateProposalsHandler = useCallback((proposal) => {
    setProposals((props) => [...props, proposal]);
  }, []);

  const proposalDescriptionHandler = async (event) => {
    setProposalDescription(event.target.value);
  };

  const createProposalHandler = async () => {
    if (status != 'ProposalsRegistrationStarted') {
      setError({
        title: 'Bad status',
        message: 'an error message'
      });
    } else {
      await contract.methods.addProposal(proposalDescription).send({ from: accounts[0] });
    }
  };

  const onVoteHandler = async (id) => {
    if (status != 'VotingSessionStarted') {
      setError({
        title: 'Bad status',
        message: 'an error message'
      });
    } else {
      await contract.methods.setVote(id).send({ from: accounts[0] });
    }
  };

  const errorHandler = () => {
    setError(null);
  };

  const home = (
    <>
      {error && <ErrorModal title={error.title} message={error.message} onClick={errorHandler} />}
      {registered && (
        <div className="mt-6 mx-auto w-2/3">
          <div className="flex flex-row justify-between text-center">
            <div className="space-x-4">
              <input
                className="rounded-md h-8 p-2 my-2"
                type="text"
                placeholder="Your proposal description"
                onChange={proposalDescriptionHandler}
              />
              <Button
                label="Create Proposal"
                onClick={createProposalHandler}
                disable={status != 1 ?? true}
              />
            </div>
            <div className="text-slate-700">
              Workflow Status:{' '}
              <span className="text-slate-700 text-xl border border-slate-700 rounded-lg p-2 my-2">
                {status}
              </span>
            </div>
          </div>
          <div>
            <ProposalList proposals={proposals} onVote={onVoteHandler} />
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="flex flex-col mx-auto bg-background bg-cover min-h-screen">
      {!artifact ? <NoticeNoArtifact /> : !contract ? <NoticeWrongNetwork /> : home}
    </div>
  );
};

export default Home;
