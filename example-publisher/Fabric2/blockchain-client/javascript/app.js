const express = require('express')
const app = express()
const http = require('http')
var log4js = require('log4js')
var logger = log4js.getLogger('SampleWebApp')
var bodyParser = require('body-parser')
var cors = require('cors')
const path = require('path')
const fs = require('fs')
const { Gateway, Wallets } = require('fabric-network')
const FabricCAServices = require('fabric-ca-client')

logger.level = 'debug'
var host = 'localhost'
var port = process.env.PORT

app.options('*', cors())
app.use(cors())
//support parsing of application/json type post data
app.use(bodyParser.json())
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
	extended: false
}))

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// START SERVER /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
var server = http.createServer(app).listen(port, function() {})
logger.info('****************** SERVER STARTED ************************')
logger.info('***************  http://%s:%s  ******************',host,port)
server.timeout = 240000

function getErrorMessage(field) {
	var response = {
		success: false,
		message: field + ' field is missing or Invalid in the request'
	}
	return response
}


///////////////////////////////////////////////////////////////////////////////
///////////////////////// REST ENDPOINTS START HERE ///////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Register and enroll user
app.post('/users', async function(req, res) {
	logger.info("Receieved request for user registration.")
	var username = req.body.username
	var orgName = req.body.orgName
	var orgNameLower = orgName.toLowerCase()
	logger.debug('End point : /users')
	logger.debug('User name : ' + username)
	logger.debug('Org name  : ' + orgName)
	logger.debug('Org name lower : ' + orgNameLower)

	try {
        // load the network configuration
		const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', `${orgNameLower}.example.com`, `connection-${orgNameLower}.json`)
		console.log(ccpPath)
		const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'))
		

        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities[`ca.${orgNameLower}.example.com`].url
        const ca = new FabricCAServices(caURL)

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet')
        const wallet = await Wallets.newFileSystemWallet(walletPath)
        console.log(`Wallet path: ${walletPath}`)

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get(username)
        if (userIdentity) {
            console.log(`An identity for the user ${username} already exists in the wallet`)
            return
        }

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get('admin')
        if (!adminIdentity) {
            console.log('An identity for the admin user "admin" does not exist in the wallet')
            return
        }

        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type)
        const adminUser = await provider.getUserContext(adminIdentity, 'admin')

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: `${orgNameLower}.department1`,
            enrollmentID: username,
            role: 'client'
        }, adminUser)
        const enrollment = await ca.enroll({
            enrollmentID: username,
            enrollmentSecret: secret
        })
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: `${orgName}MSP`,
            type: 'X.509',
        }
        await wallet.put(username, x509Identity)
		console.log(`Successfully registered and enrolled admin user ${username} and imported it into the wallet`)
		res.json({success: true})

    } catch (error) {
        console.error(`Failed to register user ${username}: ${error}`)
        res.json({success: false, message: error})
    }

})

// Query on chaincode on target peers
app.get('/channels/:channelName/chaincodes/:chaincodeName', async function(req, res) {
	logger.debug('==================== QUERY BY CHAINCODE ==================');
	var channelName = req.params.channelName;
	var chaincodeName = req.params.chaincodeName;
	let args = req.query.args;
	let fcn = req.query.fcn;
	let peer = req.query.peer;

	logger.debug('channelName : ' + channelName);
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('fcn : ' + fcn);
	logger.debug('args : ' + args);

	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!fcn) {
		res.json(getErrorMessage('\'fcn\''));
		return;
	}
	if (!args) {
		res.json(getErrorMessage('\'args\''));
		return;
	}
	args = args.replace(/'/g, '"');
	args = JSON.parse(args);
	logger.debug(args);

	try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(chaincodeName);

        // Evaluate the specified transaction.
        // queryTopic transaction - requires 1 argument, ex: ('queryTopic', 'CAR4')
        // queryAllTopics transaction - requires no arguments, ex: ('queryAllTopics')
        const result = await contract.evaluateTransaction(fcn);

		console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
		res.send(`Transaction has been evaluated, result is: ${result.toString()}`)

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.send(`Failed to evaluate transaction: ${error}`)
    }

	// let message = await query.queryChaincode(peer, channelName, chaincodeName, args, fcn, req.username, req.orgname);
	// res.send(message);
});


// Invoke transaction on chaincode on target peers
app.post('/channels/:channelName/chaincodes/:chaincodeName', async function(req, res) {
	logger.debug('==================== INVOKE ON CHAINCODE ==================');
	var peers = req.body.peers;
	var chaincodeName = req.params.chaincodeName;
	var channelName = req.params.channelName;
	var fcn = req.body.fcn;
	var args = req.body.args;
	logger.debug('channelName  : ' + channelName);
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('fcn  : ' + fcn);
	logger.debug('args  : ' + args);
	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!fcn) {
		res.json(getErrorMessage('\'fcn\''));
		return;
	}
	if (!args) {
		res.json(getErrorMessage('\'args\''));
		return;
	}

	try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(chaincodeName);

		// Submit the specified transaction.
        await contract.submitTransaction(fcn, args[0], args[1]);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
		await gateway.disconnect();
		res.send('Transaction has been submitted')

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.send(`Failed to submit transaction: ${error}`)
    }
    
	
	// res.send(message);
});