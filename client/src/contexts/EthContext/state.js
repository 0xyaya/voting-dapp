const actions = {
  init: 'INIT',
  updateStatus: 'UPDATE_STATUS'
};

const initialState = {
  artifact: null,
  web3: null,
  accounts: null,
  networkID: null,
  contract: null,
  status: null
};

const reducer = (state, action) => {
  const { type, data } = action;
  switch (type) {
    case actions.init:
      return { ...state, ...data };
    case actions.updateStatus:
      return { ...state, ...data };
    default:
      throw new Error('Undefined reducer action type');
  }
};

export { actions, initialState, reducer };
