import { useState, useEffect, useCallback } from 'react';
import useEth from '../contexts/EthContext/useEth';
import Button from '../components/UI/Button';
import ErrorModal from '../components/UI/ErrorModal';
import SuccessModal from '../components/UI/SuccessModal';
import ProposalList from '../components/Proposal/ProposalList';
import NoticeNoArtifact from '../components/Notice/NoticeNoArtifact';
import NoticeWrongNetwork from '../components/Notice/NoticeWrongNetwork';

const Home = () => {
  const {
    state: { artifact, web3, contract, accounts, status }
  } = useEth();
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposals, setProposals] = useState([]);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState();
  const [success, setSuccess] = useState();

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
        await contract
          .getPastEvents('ProposalRegistered', {
            fromBlock: 0,
            toBlock: 'latest'
          })
          .then(async (events) => {
            const tmpProposals = await Promise.all(
              events.map(async (event, index) => {
                const tx = await web3.eth.getTransactionReceipt(event.transactionHash);
                const id = index + 1;
                const proposal = await contract.methods
                  .getOneProposal(id)
                  .call({ from: accounts[0] });
                return { ...proposal, from: tx.from, id: id, txHash: tx.transactionHash };
              })
            );
            setProposals(tmpProposals);
          });

        await contract.events
          .ProposalRegistered({ fromBlock: 'earliest' })
          .on('data', async (event) => {
            const proposal = await contract.methods
              .getOneProposal(event.returnValues.proposalId)
              .call({ from: accounts[0] });

            updateProposalsHandler({
              ...proposal,
              from: 'testAddr',
              txHash: 'testHash',
              id: event.returnValues.proposalId
            });
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
      setError('ProposalsRegistrationStarted status required');
    } else {
      await contract.methods.addProposal(proposalDescription).send({ from: accounts[0] });
      setSuccess('Proposal successfully created');
    }
  };

  const onVoteHandler = async (id) => {
    if (status != 'VotingSessionStarted') {
      setError('VotingSessionStarted status required');
    } else {
      await contract.methods.setVote(id).send({ from: accounts[0] });
    }
  };

  const errorHandler = () => {
    setError(null);
  };

  const successHandler = () => {
    setSuccess(null);
  };

  const home = (
    <>
      {error && <ErrorModal title={error.title} message={error.message} onClick={errorHandler} />}
      {success && <SuccessModal message={success} onClick={successHandler} />}
      {registered && (
        <div className="mt-6 mx-auto w-2/3">
          <div className="flex flex-row justify-between text-center">
            <div className="space-x-4">
              <input
                className="rounded-md h-8 p-2 my-2 border border-sky-800"
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
            <div className="flex flex-col lg:flex-row items-center lg:space-x-4 text-slate-700 align">
              <label>Workflow Status:</label>
              <span className="text-sky-800 text-xl border border-sky-800 rounded-lg p-2 lg:mt-0">
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
