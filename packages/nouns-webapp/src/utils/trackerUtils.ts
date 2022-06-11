import config from '../config';
import { Contract, providers, utils } from 'ethers';
import { NounsTokenABI } from '@nouns/contracts';
import { NounsAuctionHouseABI } from '@nouns/sdk';
import { request, gql } from 'graphql-request'
import { TokenMetadata, GraphAuction, ContractAuction } from './trackerTypes';

const auctionHouseABI = new utils.Interface(NounsAuctionHouseABI);

/**
 * Get the latest auction data of a Noun
 * @param auctionHouseProxyAddress The Auction House Proxy address
 * @returns The svg buffer of the Noun or undefined
 */
export async function getAuction(auctionHouseProxyAddress: string): Promise<ContractAuction | undefined> {

  	const jsonRpcProvider = new providers.JsonRpcProvider(config.app.jsonRpcUri);

	if (auctionHouseProxyAddress) {

		const nounsAuctionHouseContract = new Contract(
			auctionHouseProxyAddress,
			auctionHouseABI,
			jsonRpcProvider,
	  	);

	  	const auction = await nounsAuctionHouseContract.auction();
	  	return auction;
	}
}

export async function getBlockNumber(): Promise<number | undefined> {
  	const jsonRpcProvider = new providers.JsonRpcProvider(config.app.jsonRpcUri);
  	const blockNumber = (await jsonRpcProvider.getBlockNumber());
	return blockNumber;	
}


/**
 * Get the SVG buffer data of a Noun
 * @param tokenAddress The ERC721 token address
 * @param tokenId The ERC721 token id
 * @returns The svg buffer of the Noun or undefined
 */
export async function getNounSVGBuffer(tokenAddress: string, tokenId: string, svgFunction?: string): Promise<Buffer | undefined> {

  	const jsonRpcProvider = new providers.JsonRpcProvider(config.app.jsonRpcUri);

	if (tokenAddress && tokenId) {

		const nounsTokenContract = new Contract(
			tokenAddress,
			NounsTokenABI,
			jsonRpcProvider,
	  	);

	  	const dataURI = (svgFunction === 'tokenURI') ? await nounsTokenContract.tokenURI(tokenId) : await nounsTokenContract.dataURI(tokenId);

	  	if (dataURI) {
			const data: TokenMetadata = JSON.parse(
			    Buffer.from(dataURI.substring(29), 'base64').toString('ascii'),
			);

			const svg = Buffer.from(data.image.substring(26), 'base64');
			return svg;
	  	}	
	}
}

/**
 * Query the subgraph and return the last auction id and bid created.
 * @param subgraphApiUri The token subgraph api uri
 * @returns The last auction id and bid from the subgraph.
 */
export async function getLastAuctionBids(subgraphApiUri: string): Promise<GraphAuction> {
  const res = await request<{ auctions: GraphAuction[] }>(
    subgraphApiUri,
    gql`
      query {
        auctions(orderBy: startTime, orderDirection: desc, first: 1) {
          id
          endTime
          bids(orderBy: blockNumber, orderDirection: desc, first: 1) {
            id
            amount
            bidder {
              id
            }
          }
        }
      }
    `,
  );
  return res.auctions[0];
}

/**
 * Query the subgraph and return the recent auction data to show stats.
 * @param subgraphApiUri The token subgraph api uri
 * @returns The most recent auctions and final bids from the subgraph.
 */
export async function getRecenttAuctionBids(subgraphApiUri: string, subgraphType?: string): Promise<GraphAuction[]> {

  if (subgraphType === 'flat') {
  
	  const res = await request<{ auctionBids: GraphAuction[] }>(
	    subgraphApiUri,
	    gqlRecenttAuctionBidsFlat,
	  );
	  return res.auctionBids;
  
  } else {
  
	  const res = await request<{ auctions: GraphAuction[] }>(
	    subgraphApiUri,
	    gqlRecenttAuctionBids,
	  );
	  return res.auctions;
  
  }
}

const gqlRecenttAuctionBids = gql`
  query {
	  auctions(orderBy: startTime, orderDirection: desc, first: 26) {
	    id
	    bids(orderBy: blockNumber, orderDirection: desc, first: 1) {
	      amount
	    }
	  }
  }
`;

const gqlRecenttAuctionBidsFlat = gql`
  query {
	  auctionBids (orderBy: timestamp, orderDirection: desc, first: 26) {
	    id
	    value
	  }
  }
`;