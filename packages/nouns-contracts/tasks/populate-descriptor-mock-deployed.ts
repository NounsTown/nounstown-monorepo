import { task, types } from 'hardhat/config';
import ImageData from '../files/image-data-deployed.json';
import { chunkArray } from '../utils';

task('populate-descriptor-mock-deployed', 'Populates the mock deployed descriptor with color palettes and Noun parts')
  .addOptionalParam(
    'nftDescriptor',
    'The `NFTDescriptor` contract address',
    '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    types.string,
  )
  .addOptionalParam(
    'nounsDescriptor',
    'The `NounsDescriptor` contract address',
    '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    types.string,
  )
  .setAction(async ({ nftDescriptor, nounsDescriptor }, { ethers }) => {
    const descriptorFactory = await ethers.getContractFactory('NounsDescriptorDeployed', {
      libraries: {
        NFTDescriptor: nftDescriptor,
      },
    });
    const descriptorContract = descriptorFactory.attach(nounsDescriptor);

    const { bgcolors, palette, images } = ImageData;
    const { bodies, accessories, heads, glasses } = images;

    // Chunk head and accessory population due to high gas usage
    await descriptorContract.addManyBackgrounds(bgcolors);
    await descriptorContract.addManyColorsToPalette(0, palette);
    await descriptorContract.addManyBodies(bodies.map(({ data }) => data));

    const accessoryChunk = chunkArray(accessories, 10);
    for (const chunk of accessoryChunk) {
      await descriptorContract.addManyAccessories(chunk.map(({ data }) => data));
    }

    const headChunk = chunkArray(heads, 10);
    for (const chunk of headChunk) {
      await descriptorContract.addManyHeads(chunk.map(({ data }) => data));
    }

    await descriptorContract.addManyGlasses(glasses.map(({ data }) => data));

    console.log('Deployed Descriptor populated with palettes and parts.');

	//const version1 = await descriptorContract.getVersion();
	//console.log('Deployed version', version1);
    	
	const bodyCount = await descriptorContract.bodyCount();
	console.log('Deployed body count', bodyCount);
	
	const body1 = await descriptorContract.bodies(0);
	console.log('Deployed body 1', body1);    

	const bg1 = await descriptorContract.backgrounds(0);
	console.log('Deployed bg 1', bg1);
  });
