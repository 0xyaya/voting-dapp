import Button from '../UI/Button';
import ExtLink from '../../../public/ext-link.svg';

const ProposalItem = ({ id, description, from, txHash, voteCount, onClick }) => {
  const onClickHandler = () => {
    onClick(id);
  };

  const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;

  const truncateEthAddress = (address) => {
    const match = address.match(truncateRegex);
    if (!match) return address;
    return match[1] + '\u2026' + match[2];
  };

  const txLink = `https://mumbai.polygonscan.com/tx/${txHash}`;
  const fromLink = `https://mumbai.polygonscan.com/address/${from}`;

  return (
    <div className="flex flex-col w-full lg:w-1/4 mr-6 my-3 p-4 bg-cyan-100 text-slate-700 hover:bg-cyan-200 px-4 rounded-lg border border-sky-800 duration-150">
      <div className="mb-4">
        <label>ID: </label>
        <span>{id}</span>
        <p>Description: {description}</p>
      </div>
      <div className="flex-grow border-t border-gray-400"></div>

      <div className="my-4">
        <a href={fromLink} className="underline flex flex-row" target="_blank">
          From: {truncateEthAddress(from)}
          <img src={ExtLink} alt="Address Link" className="w-4" />
        </a>
        <a href={txLink} className="underline flex flex-row" target="_blank">
          TxHash: {truncateEthAddress(txHash)}
          <img src={ExtLink} alt="Address Link" className="w-4" />
        </a>
      </div>
      <Button label="Voter" onClick={onClickHandler} />
      <span className="mt-2">Vote count: {voteCount}</span>
    </div>
  );
};

export default ProposalItem;
