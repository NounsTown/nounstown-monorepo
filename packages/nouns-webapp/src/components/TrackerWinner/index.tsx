import { Button, Row, Col } from 'react-bootstrap';
import { useAppSelector } from '../../hooks';
import classes from './TrackerWinner.module.css';
import ShortAddress from '../ShortAddress';
import clsx from 'clsx';
import { isMobileScreen } from '../../utils/isMobile';
import { Trans } from '@lingui/macro';
import { useActiveLocale } from '../../hooks/useActivateLocale';

interface TrackerWinnerProps {
  winner: string;
  isNounders?: boolean;
  auctionEnded: boolean;
}

const TrackerWinner: React.FC<TrackerWinnerProps> = props => {
  const { winner, isNounders, auctionEnded } = props;
  const activeAccount = useAppSelector(state => state.account.activeAccount);

  const isCool = useAppSelector(state => state.application.isCoolBackground);
  const isMobile = isMobileScreen();

  const isWinnerYou =
    activeAccount !== undefined && activeAccount.toLocaleLowerCase() === winner.toLocaleLowerCase();

  const activeLocale = useActiveLocale();

  const nonNounderNounContent = isWinnerYou ? (
    <Row className={classes.youSection}>
      <Col lg={activeLocale === 'ja-JP' ? 8 : 4} className={classes.youCopy}>
        <h2
          className={classes.winnerContent}
          style={{
            color: isCool ? 'white' : 'white',
          }}
        >
          <Trans>You</Trans>
        </h2>
      </Col>
      {!isMobile && false && (
        <Col>
          <a
            href="/nounies"
            target="_blank"
            rel="noreferrer noopener"
            className={classes.verifyLink}
          >
            <Button className={classes.verifyButton}>
              <Trans>What now?</Trans>
            </Button>
          </a>
        </Col>
      )}
    </Row>
  ) : (
    <ShortAddress size={40} address={winner} avatar={true} />
  );

  const nounderNounContent = 'Nouncil';

  return (
    <>
      <Row className={clsx(classes.wrapper, classes.section)}>
        <Col xs={1} lg={12} className={classes.leftCol}>
          <h4
            style={{
              color: isCool ? '#a3efd0' : '#a3efd0',
            }}
            className={classes.winnerCopy}
          >
          	{auctionEnded ? 'Winner' : 'Top Bidder'}
          </h4>
        </Col>
        <Col xs="auto" lg={12}>
          <h2
            className={classes.winnerContent}
            style={{
              color: isCool ? 'white' : 'white',
            }}
          >
            {isNounders ? nounderNounContent : nonNounderNounContent}
          </h2>
        </Col>
      </Row>
      {isWinnerYou && isMobile && (
        <Row>
          <a
            href="/nounies"
            target="_blank"
            rel="noreferrer noopener"
            className={classes.verifyLink}
          >
            <Button className={classes.verifyButton}>
              <Trans>What now?</Trans>
            </Button>
          </a>
        </Row>
      )}
    </>
  );
};

export default TrackerWinner;
