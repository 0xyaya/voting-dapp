// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";


/**
 * @author Cyril Castagnet
 * @title Voting
 * @dev Satoshi dev project 3 smart contract
 */

contract Voting is Ownable {
    /**
    * @dev _wid Secret winning proposal identification number
    * @dev winningProposalID Final winning proposal identification number
     */
    uint public winningProposalID;
    uint private _wid;

    /**
    * @dev Structure to define Voter users
    */
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    /**
    * @dev Structure to define Proposal candidates
    */
    struct Proposal {
        string description;
        uint voteCount;
    }

    /**
    * @dev Structure to define Voter users
    */
    enum  WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    /**
    * @dev State variable to store Worfkflow state
    */
    WorkflowStatus public workflowStatus;
    /**
    * @dev List of propoposals candidates stored on-chain
    */
    Proposal[] proposalsArray;
    /**
    * @dev Voters on-chain registry
    */
    mapping (address => Voter) voters;

    /**
    * @dev Event for client comunications
    */
    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);
    
    /**
     * @dev Only allow registered addresses
     */
    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "Address not registered");
        _;
    }

    /**
     * @dev Only at given workflow 
     * @param   _status Required workflowStatus state
     */
    modifier atWorkflowStatus(WorkflowStatus _status) {
        require(workflowStatus == _status, "Action outside event scope");
        _;
    }

    /**
     * @dev Moves to next WorkFlowStatus state
     */
    modifier workflowStatusTransit() {
        _;
        nextWorkflowStatus();
    }

    /**
     * @dev Increment workflowStatus state variable
     */
    function nextWorkflowStatus() internal {
        workflowStatus = WorkflowStatus(uint(workflowStatus)+1);
    }
    
    // ::::::::::::: GETTERS ::::::::::::: //

    /**
     * @dev Returns a voter given an address
     * @param   _addr Registered address
     * @return  Voter Voter associated with the address
     */
    function getVoter(address _addr) external onlyVoters view returns (Voter memory) {
        return voters[_addr];
    }
    
    /**
     * @dev Returns a proposal
     * @param   _id Proposal identification number
     * @return  Proposal Proposal associated with the id
     */
    function getOneProposal(uint _id) external onlyVoters view returns (Proposal memory) {
        return proposalsArray[_id];
    }
 
    // ::::::::::::: REGISTRATION ::::::::::::: // 

    /**
     * @dev Adds a voter's address to the whitelist
     * @param   _addr The address to be registered
     */
    function addVoter(address _addr) external onlyOwner atWorkflowStatus(WorkflowStatus.RegisteringVoters) {
        require(voters[_addr].isRegistered != true, "Already registered");
    
        voters[_addr].isRegistered = true;
        
        emit VoterRegistered(_addr);
    }

    // ::::::::::::: PROPOSAL ::::::::::::: // 

    /**
     * @dev Registers a proposal
     * @param   _desc Text description of the proposal
     */
    function addProposal(string calldata _desc) external onlyVoters atWorkflowStatus(WorkflowStatus.ProposalsRegistrationStarted) {
        require(keccak256(abi.encode(_desc)) != keccak256(abi.encode("")), "You must enter a description");

        Proposal memory proposal;
        proposal.description = _desc;
        proposalsArray.push(proposal);

        emit ProposalRegistered(proposalsArray.length-1);
    }

    // ::::::::::::: VOTE ::::::::::::: //

    /**
     * @dev Allows registered voters to vote for a registered proposal
     * @param   _id Voted proposal identification number
     */
    function setVote(uint _id) external onlyVoters atWorkflowStatus(WorkflowStatus.VotingSessionStarted) {
        require(voters[msg.sender].hasVoted != true, "You have already voted");
        require(_id < proposalsArray.length, "Proposal not found"); 

        voters[msg.sender].votedProposalId = _id;
        voters[msg.sender].hasVoted = true;
        proposalsArray[_id].voteCount++;

        if (proposalsArray[_id].voteCount > proposalsArray[_wid].voteCount) _wid = _id;

        emit Voted(msg.sender, _id);
    }

    // ::::::::::::: STATE ::::::::::::: //

    /**
     * @dev Allows admin user to start proposal registration period
     */
    function startProposalsRegistering() external onlyOwner atWorkflowStatus(WorkflowStatus.RegisteringVoters) workflowStatusTransit {
        Proposal memory proposal;
        proposal.description = "GENESIS";
        proposalsArray.push(proposal);
        
        emit WorkflowStatusChange(
            WorkflowStatus.RegisteringVoters, 
            WorkflowStatus.ProposalsRegistrationStarted
        );
    }

    /**
     * @dev Allows admin user to end proposal registration period
     */
    function endProposalsRegistering() external onlyOwner atWorkflowStatus(WorkflowStatus.ProposalsRegistrationStarted) workflowStatusTransit {
        emit WorkflowStatusChange(
            WorkflowStatus.ProposalsRegistrationStarted, 
            WorkflowStatus.ProposalsRegistrationEnded
        );
    }

    /**
     * @dev Allows admin user to start voting session
     */
    function startVotingSession() external onlyOwner atWorkflowStatus(WorkflowStatus.ProposalsRegistrationEnded) workflowStatusTransit {
        emit WorkflowStatusChange(
            WorkflowStatus.ProposalsRegistrationEnded, 
            WorkflowStatus.VotingSessionStarted
        );
    }

    /**
     * @dev Allows admin user to end voting session
     */
    function endVotingSession() external onlyOwner atWorkflowStatus(WorkflowStatus.VotingSessionStarted) workflowStatusTransit {
        emit WorkflowStatusChange(
            WorkflowStatus.VotingSessionStarted, 
            WorkflowStatus.VotingSessionEnded
        );
    }

    /**
     * @dev Allows admin user to tally votes and set winning proposal
     */
    function tallyVotes() external onlyOwner atWorkflowStatus(WorkflowStatus.VotingSessionEnded) workflowStatusTransit {
        winningProposalID = _wid;

        emit WorkflowStatusChange(
            WorkflowStatus.VotingSessionEnded, 
            WorkflowStatus.VotesTallied
        );
    }
}
