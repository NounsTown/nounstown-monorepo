import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProposalStatus from '../ProposalStatus';
import classes from './ProposalHeader.module.css';
import navBarButtonClasses from '../NavBarButton/NavBarButton.module.css';
import { Proposal, useHasVotedOnProposal, useProposalVote } from '../../wrappers/nounsDao';
import clsx from 'clsx';
import { isMobileScreen } from '../../utils/isMobile';
import { useUserVotesAsOfBlock } from '../../wrappers/nounToken';
import { useBlockTimestamp } from '../../hooks/useBlockTimestamp';
import dayjs from 'dayjs';
import ShortAddress from '../ShortAddress';
import { transactionLink } from '../ProposalContent';
import { buildEtherscanAddressLink } from '../../utils/etherscan';

interface ProposalHeaderProps {
  proposal: Proposal;
  isActiveForVoting?: boolean;
  isWalletConnected: boolean;
  submitButtonClickHandler: () => void;
}

const ProposalHeader: React.FC<ProposalHeaderProps> = props => {
  const { proposal, isActiveForVoting, isWalletConnected, submitButtonClickHandler } = props;

  const isMobile = isMobileScreen();
  const availableVotes = useUserVotesAsOfBlock(proposal?.createdBlock) ?? 0;
  const hasVoted = useHasVotedOnProposal(proposal?.id);
  const proposalVote = useProposalVote(proposal?.id);
  const proposalCreationTimestamp = useBlockTimestamp(proposal?.createdBlock);
  const disableVoteButton = !isWalletConnected || !availableVotes || hasVoted;

  const voteButton = (
    <>
      {isWalletConnected ? (
        <>{!availableVotes && <div className={classes.noVotesText}>You have no votes.</div>}</>
      ) : (
        <div className={classes.connectWalletText}>Connect a wallet to vote.</div>
      )}
      <Button
        className={disableVoteButton ? classes.submitBtnDisabled : classes.submitBtn}
        disabled={disableVoteButton}
        onClick={submitButtonClickHandler}
      >
        Submit vote
      </Button>
    </>
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex justify-content-start align-items-start">
          <Link to={'/vote'}>
            <button className={clsx(classes.backButton, navBarButtonClasses.whiteInfo)}>←</button>
          </Link>
          <div className={classes.headerRow}>
            <span>
              <div className="d-flex">
                <div>Proposal {proposal.id}</div>
                <div>
                  <ProposalStatus status={proposal?.status} className={classes.proposalStatus} />
                </div>
              </div>
            </span>
            <div className={classes.proposalTitleWrapper}>
              <div className={classes.proposalTitle}>
                <h1>{proposal.title} </h1>
              </div>
            </div>
          </div>
        </div>
        {!isMobile && (
          <div className="d-flex justify-content-end align-items-end">
            {isActiveForVoting && voteButton}
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h3 style={{
            fontFamily: 'Londrina Solid',
            color: 'var(--brand-gray-light-text)',
            marginLeft: '3rem',
            fontSize: '24px'
        }}>Proposed by:</h3> 
        
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          marginLeft: '2.5rem'
        }}>
        <h3 style={{
          fontFamily: 'Londrina Solid',
          marginLeft: '0.5rem',
          fontSize: '24px'
        }}>

          <a href={buildEtherscanAddressLink(proposal.proposer || "")} target="_blank" rel="noreferrer">
            <ShortAddress address={proposal.proposer || ""} avatar={false}/>
          </a>

          <span style={{
            marginLeft: '0.33rem',
            marginRight: '0.5rem',
            fontWeight: 'bold',
            fontSize: '18px',
            color: 'var(--brand-gray-light-text)'
          }}>
            at <span style={{
              marginLeft: '0.2rem'
            }}>
              {transactionLink(proposal.transactionHash)}
            </span>
          </span> 
        </h3>
        </div>
      </div>

      {isMobile && (
        <div className={classes.mobileSubmitProposalButton}>{isActiveForVoting && voteButton}</div>
      )}

      {proposal && isActiveForVoting && hasVoted && (
        <Alert variant="success" className={classes.voterIneligibleAlert}>
          You voted <strong>{proposalVote}</strong> this proposal
        </Alert>
      )}

      {proposal && isActiveForVoting && proposalCreationTimestamp && !!availableVotes && !hasVoted && (
        <Alert variant="success" className={classes.voterIneligibleAlert}>
          Only Nouns you owned or were delegated to you before{' '}
          {dayjs.unix(proposalCreationTimestamp).format('MMMM D, YYYY h:mm A z')} are eligible to
          vote.
        </Alert>
      )}
    </>
  );
};

export default ProposalHeader;
