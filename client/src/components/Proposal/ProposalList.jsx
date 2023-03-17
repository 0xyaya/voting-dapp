import ProposalItem from './ProposalItem';

const ProposalList = ({ proposals, onVote }) => {
  const onClickHandler = (id) => {
    onVote(id);
  };

  return (
    <div className="flex flex-wrap justify-start mt-4">
      {proposals.map((proposal, index) => (
        <ProposalItem
          key={index}
          author={proposal.from}
          txHash={proposal.txHash}
          id={proposal.id}
          description={proposal.description}
          voteCount={proposal.voteCount}
          onClick={onClickHandler}
        />
      ))}
    </div>
  );
};

export default ProposalList;
