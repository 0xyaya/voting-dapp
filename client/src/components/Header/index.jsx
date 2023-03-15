import { useState, useEffect, useReducer } from 'react';
import useEth from '../../contexts/EthContext/useEth';

function Header() {
  const {
    state: { contract, accounts }
  } = useEth();

  return (
    <div className="flex flex-row justify-between bg-cyan-600 w-full p-4 text-slate-200 border-b border-cyan-900">
      <div className="w-1/2 mx-auto space-x-8">
        <a href="/" className="text-2xl hover:underline">
          Voting Dapp
        </a>
        <a href="/admin" className="text-2xl hover:underline">
          Admin
        </a>
      </div>
      <div className="w-1/3 text-lg">{accounts && accounts[0] && <pre>{accounts[0]}</pre>}</div>
    </div>
  );
}

export default Header;
