import ProposalItem from './ProposalItem';

const ProposalList = ({ proposals, onVote }) => {
  const onClickHandler = (id) => {
    onVote(id);
  };

  return (
    <div className="mt-4 space-y-2">
      {proposals.map((proposal, index) => (
        <ProposalItem
          key={index}
          author="0x326a.."
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
