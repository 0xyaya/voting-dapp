import Button from '../UI/Button';

const ProposalItem = ({ id, description, author, voteCount, onClick }) => {
  const onClickHandler = () => {
    onClick(id);
  };

  return (
    <div className="flex flex-col justify-around items-center p-4 bg-cyan-100 text-slate-800 hover:bg-cyan-200 px-4 rounded-lg border border-sky-800 duration-150">
      <h3 className="text-lg">{id}</h3>
      <div className="text-sm text-slate-500">
        <span>by</span>
        <a href="#" className=" underline">
          {' '}
          {author}
        </a>
      </div>
      <p className="my-4">{description}</p>
      <Button label="Voter" onClick={onClickHandler} />
      <span>vote count: {voteCount}</span>
    </div>
  );
};

export default ProposalItem;
