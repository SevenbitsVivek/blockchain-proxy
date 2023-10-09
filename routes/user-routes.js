var express = require('express'),
  _ = require('lodash'),
  config = require('../config'),
  jwt = require('jsonwebtoken'),
  expressjwt = require('express-jwt'),
  transaction = require('../action/transaction');
const { v4: uuidv4 } = require('uuid');

var app = module.exports = express.Router();

/**
 * Sytem default admin user 
 * It can be use to add new user in the system
 * To change username and password please update below username and password and 
 * restart the project.
 */
var users = [{
  id: 1,
  username: 'Admin',
  password: 'h5P73m8m2qnVynPD'
}];

/**
 * Function will create unique id for each JWT accessToken
 * it help the system to uniqly identify the each JWT Token. 
 */
function createIdToken(user) {
  return jwt.sign(_.omit(user, 'password'), config.secret, { expiresIn: 60 * 60 * 24 });
}

/**
 * Function will generate new JWT access token
 * JWT access token will be used to authenticate user in the system. 
 */
function createAccessToken() {
  return jwt.sign({
    iss: config.issuer,
    aud: config.audience,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
    scope: 'full_access',
    sub: "bnbsender|Osilla",
    jti: genJti(), // unique identifier for the token
    alg: 'HS256'
  }, config.secret);
}

/**
 * Generate Unique Identifier for the access token
 */
function genJti() {
  let jti = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 16; i++) {
    jti += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return jti;
}

/**
 * Function will fetch user information from request data and search it 
 * in existing user base in the system.
 * it will return user object with username and type.
 */
function getUserScheme(req) {
  var username;
  var type;
  var userSearch = {};
  // The POST contains a username and not an email
  if (req.body.username) {
    username = req.body.username;
    type = 'username';
    userSearch = { username: username };
  }
  return {
    username: username,
    type: type,
    userSearch: userSearch
  }
}

/**
 * Function will fetch user information from request data and search it 
 * in existing user base in the system.
 * it will return user object with username and type.
 */
function getNewUserScheme(user) {
  var username;
  var type;
  var userSearch = {};
  // The POST contains a username and not an email
  if (user.username) {
    username = user.username;
    type = 'username';
    userSearch = { username: username };
  }
  return {
    username: username,
    type: type,
    userSearch: userSearch
  }
}


/**
 * Check method will validate the JWT Token provided by the user in the Request Header.
 */
var jwtCheck = expressjwt({
  secret: config.secret,
  audience: config.audience,
  issuer: config.issuer
});

/**
 * Function will will check the scope of the JWT Token provided by the user in the Request Header.
 */
function requireScope(req, res, next) {
  var scope = 'full_access';
  var has_scopes = req.user.scope === scope;
  if (!has_scopes) {
    return res.status(401).send("Access Denied");
  }
  next();
}

/**
 * API adduser will allow admin user to add new user in the system
 * Admin needs to provide new user information alog with the password.
 */
app.post('/adduser', function (req, res) {
  try {
    var userScheme = getUserScheme(req);
    if (!userScheme.username || !req.body.password || !req.body.user) {
      let response = {}
      response.status = false;
      response.code = 400;
      response.error = "You must send the username,password and the new user details";
      return res.status(400).send(response);
    }
    var user = _.find(users, userScheme.userSearch);
    if (!user) {
      let response = {}
      response.status = false;
      response.code = 400;
      response.error = "The username or password don't match";
      return res.status(400).send(response);
    }
    if (user.password !== req.body.password) {
      let response = {}
      response.status = false;
      response.code = 400;
      response.error = "The username or password don't match";
      return res.status(400).send(response);
    }
    var newUserScheme = getNewUserScheme(req.body.user);
    if (_.find(users, newUserScheme.userSearch)) {
      let response = {}
      response.status = false;
      response.code = 400;
      response.error = "A user with that username already exists";
      return res.status(400).send(response);
    }
    var profile = _.pick(req.body.user, newUserScheme.type, 'password');
    profile.id = _.max(users, 'id').id + 1;
    users.push(profile);
    res.status(200).send({
      id_token: createIdToken(profile),
      access_token: createAccessToken()
    });
  } catch (error) {
    // Handle any errors that may occur during the process
    const response = {
      status: false,
      code: 500,
      error: "An error occurred while adding the user in the database",
    };
    console.log(error)
    return res.status(500).send(response);
  }
});

app.post('/login', function (req, res) {
  try {
    var userScheme = getUserScheme(req);
    if (!userScheme.username || !req.body.password) {
      let response = {}
      response.status = false;
      response.code = 400;
      response.error = "You must send the username and the password";
      return res.status(400).send(response);
    }
    var user = _.find(users, userScheme.userSearch);
    if (!user) {
      let response = {}
      response.status = false;
      response.code = 400;
      response.error = "The username or password don't match";
      return res.status(400).send(response);
    }
    if (user.password !== req.body.password) {
      let response = {}
      response.status = false;
      response.code = 400;
      response.error = "The username or password don't match";
      return res.status(400).send(response);
    }
    res.status(200).send({
      id_token: createIdToken(user),
      access_token: createAccessToken()
    });
  } catch (error) {
    // Handle any errors that may occur during the process
    const response = {
      status: false,
      code: 500,
      error: "An error occurred while logging",
    };
    console.log(error)
    return res.status(500).send(response);
  }
});

app.post('/storePatientHash', jwtCheck, requireScope, async function (req, res) {
  try {
    if (!req.body.patientId || !req.body.hash) {
      let response = {}
      response.status = false;
      response.code = 400;
      response.error = "You must send both patientId and hash";
      return res.status(400).send(response);
    }
    // Generate a unique ID for this request
    const uniqueId = uuidv4();
    // Save the patientId and hash into the database
    const tx = await transaction.storePatientHash(req.body.patientId, req.body.hash, uniqueId);
    // Prepare the response
    const response = {
      status: true,
      code: 200,
      data: {
        patientId: req.body.patientId,
        hash: req.body.hash,
        uniqueId: uniqueId,
      },
    };
    res.status(200).send({
      response: response,
    });
  } catch (error) {
    // Handle any errors that may occur during the process
    const response = {
      status: false,
      code: 500,
      error: "An error occurred while storing the patientId and patientHash in the database",
    };
    console.log(error)
    return res.status(500).send(response);
  }
});

app.post('/addWalletInDatabase', jwtCheck, requireScope, async function (req, res) {
  try {
    if (!req.body.wallets || !Array.isArray(req.body.wallets) || req.body.wallets.length === 0) {
      let response = {
        status: false,
        code: 400,
        error: "You must send a non-empty array of objects containing walletAddress and privateKey"
      };
      return res.status(400).send(response);
    }
    const walletsData = req.body.wallets;
    // Validate each wallet object in the array
    for (const wallet of walletsData) {
      if (!wallet.walletAddress || !wallet.privateKey) {
        let response = {
          status: false,
          code: 400,
          error: "Each wallet object must contain both walletAddress and privateKey."
        };
        return res.status(400).send(response);
      }
      console.log("wallet.walletAddress ===>", wallet.walletAddress)
      // Check if the wallet address already exists in the database
      const walletExists = await transaction.checkIfWalletExistsOrNot(wallet.walletAddress, wallet.privateKey);
      console.log("walletExists ===>", walletExists)
      console.log("walletExists ===>", walletExists.rows)
      if (!(walletExists.rows == [])) {
        let response = {
          status: false,
          code: 400,
          error: `Wallet address '${wallet.walletAddress}' already exists in the database.`
        };
        return res.status(400).send(response);
      } else {
        // Insert the wallet address into the database
        await transaction.insertWalletInDatabase(wallet.walletAddress, wallet.privateKey);
      }
    }
    // Prepare the response
    const response = {
      status: true,
      code: 200,
      data: {
        message: `Added wallet addresses in the database successfully`
      },
    };
    res.status(200).send({
      response: response,
    });
  } catch (error) {
    // Handle any errors that may occur during the process
    const response = {
      status: false,
      code: 500,
      error: "An error occurred while adding the wallets to the database",
    };
    console.log(error);
    return res.status(500).send(response);
  }
});

app.post('/checkBlockchainTransaction', jwtCheck, requireScope, async function (req, res) {
  if (!req.body.uniqueId) {
    let response = {};
    response.status = false;
    response.code = 400;
    response.error = "You must provide the uniqueId.";
    return res.status(400).send(response);
  }
  // Get the uniqueId from the request body
  const uniqueId = req.body.uniqueId;
  try {
    // Check if the uniqueId exists in the database
    const isUniqueIdExists = await transaction.checkUniqueIdInDatabase(uniqueId);
    if (isUniqueIdExists.status) {
      const getTransactionStatusFromBlockchain = await transaction.getTransactionStatusFromDatabase(uniqueId)
      if (getTransactionStatusFromBlockchain.rows[0].blockchain_status === "success") {
        const getSuccessTransactionsFromDatabase = await transaction.getSuccessTransactionsFromDatabase(uniqueId)
        // Transaction exists, return success response
        const response = {
          status: true,
          code: 200,
          data: {
            message: "Transaction successfully inserted into the blockchain",
            transaction_id: getSuccessTransactionsFromDatabase.rows[0].transaction_hash,
            block_num: getSuccessTransactionsFromDatabase.rows[0].block_num,
            from_account: getSuccessTransactionsFromDatabase.rows[0].from_account,
            to_account: getSuccessTransactionsFromDatabase.rows[0].to_account,
            blockchainStatus: "success",
          },
        };
        return res.status(200).send(response);
      } else if (getTransactionStatusFromBlockchain.rows[0].blockchain_status === "sent") {
        const getTransactionHashFromDatabase = await transaction.getTransactionHashFromDatabase(uniqueId)
        const response = {
          status: true,
          code: 200,
          data: {
            message: "Transaction is being sent to the blockchain",
            transaction_id: getTransactionHashFromDatabase.rows[0].transaction_hash,
            blockchainStatus: "sent",
          },
        };
        return res.status(200).send(response);
      } else if (getTransactionStatusFromBlockchain.rows[0].blockchain_status === "pending") {
        const response = {
          status: true,
          code: 200,
          data: {
            message: "Transaction is in queue to get into the blockchain",
            blockchainStatus: "pending",
          },
        };
        return res.status(200).send(response);
      }
    } else {
      // UniqueId does not exist in the database, return an error response
      const response = {
        status: false,
        code: 404,
        error: "UniqueId not found in the database",
      };
      return res.status(404).send(response);
    }
  } catch (error) {
    // Handle any errors that may occur during the process
    const response = {
      status: false,
      code: 500,
      error: "An error occurred while checking the blockchain transactions",
    };
    console.log(error)
    return res.status(500).send(response);
  }
});

app.post('/validatePatientHash', jwtCheck, requireScope, async function (req, res) {
  if (!req.body.patientId || !req.body.hash) {
    let response = {};
    response.status = false;
    response.code = 400;
    response.error = "You must provide both patientId and hash";
    return res.status(400).send(response);
  }
  try {
    // Call the validatePatientHash function to validate the patientId and hash
    const validationResult = await transaction.validatePatientHash(req.body.patientId, req.body.hash);
    await transaction.insertValidatePatientHashTransactionDetailInDatabase(validationResult.data.inputs1, validationResult.data.inputs2, validationResult.data.transaction_id, validationResult.data.block_num, validationResult.data.from_account, validationResult.data.to_account)
    if (validationResult.data.transactionStatus === true) {
      // Respond with the validation result
      res.status(200).send({
        status: true,
        code: 200,
        data: {
          hashValidated: validationResult.data.transactionOutput
        }
      });
    } else {
      console.error("Execution reverted from blockchain")
      let response = {};
      response.status = false;
      response.code = 400;
      response.error = "Execution reverted from blockchain";
      // Send the error response
      res.status(400).send(response);
    }
  } catch (error) {
    // Handle any errors that occur during the validation process
    console.error("Validation patient hash has error:", error);
    // Create an error responsevalidationResult
    let response = {};
    response.status = false;
    response.code = 400;
    response.error = "Validation patient hash has failed: " + error.message;
    // Send the error response
    res.status(400).send(response);
  }
});

app.post('/addToWhitelist', jwtCheck, requireScope, async function (req, res) {
  if (!req.body.walletAddress) {
    let response = {};
    response.status = false;
    response.code = 400;
    response.error = "You must provide walletAddress";
    return res.status(400).send(response);
  }
  try {
    // Call the validatePatientHash function to validate the patientId and hash
    const addToWhitelist = await transaction.addToWhitelist(req.body.walletAddress);
    await transaction.insertAddToWhitelistDetailInDatabase(req.body.walletAddress, addToWhitelist.data.transaction_id, addToWhitelist.data.block_num, addToWhitelist.data.from_account, addToWhitelist.data.to_account)
    if (addToWhitelist.data.transactionStatus === true) {
      // Respond with the validation result
      res.status(200).send({
        status: true,
        code: 200,
        data: {
          message: `Added 0x${addToWhitelist.data.transactionInput} address to whitelist successfully`
        }
      });
    } else {
      console.error("Execution reverted from blockchain")
      let response = {};
      response.status = false;
      response.code = 400;
      response.error = "Execution reverted from blockchain";
      // Send the error response
      res.status(400).send(response);
    }
  } catch (error) {
    // Handle any errors that occur during the validation process
    console.error("Add to whitelist for patient has error:", error);
    // Create an error responsevalidationResult
    let response = {};
    response.status = false;
    response.code = 400;
    response.error = "Add to whitelist for patient has failed: " + error.message;
    // Send the error response
    res.status(400).send(response);
  }
});

app.post('/addManyToWhitelist', jwtCheck, requireScope, async function (req, res) {
  if (!req.body.walletAddresses || !Array.isArray(req.body.walletAddresses) || req.body.walletAddresses.length === 0) {
    let response = {
      status: false,
      code: 400,
      error: "You must provide an array of walletAddresses"
    };
    return res.status(400).send(response);
  }
  try {
    const addManyToWhitelistResult = await transaction.addManyToWhitelist(req.body.walletAddresses);
    await transaction.insertAddManyToWhitelistDetailInDatabase(req.body.walletAddresses, addManyToWhitelistResult.data.transaction_id, addManyToWhitelistResult.data.block_num, addManyToWhitelistResult.data.from_account, addManyToWhitelistResult.data.to_account)
    if (addManyToWhitelistResult.data.transactionStatus === true) {
      res.status(200).send({
        status: true,
        code: 200,
        data: {
          message: `Added ${addManyToWhitelistResult.data.transactionInput} addresses to whitelist successfully`
        }
      });
    } else {
      console.error("Execution reverted from blockchain")
      let response = {};
      response.status = false;
      response.code = 400;
      response.error = "Execution reverted from blockchain";
      // Send the error response
      res.status(400).send(response);
    }
  } catch (error) {
    console.error("Add many to whitelist for patients has error:", error);
    let response = {
      status: false,
      code: 400,
      error: "Add many to whitelist for patients has failed: " + error.message
    };
    res.status(400).send(response);
  }
});

app.post('/removeFromWhitelist', jwtCheck, requireScope, async function (req, res) {
  if (!req.body.walletAddress) {
    let response = {};
    response.status = false;
    response.code = 400;
    response.error = "You must provide walletAddress";
    return res.status(400).send(response);
  }
  try {
    // Call the validatePatientHash function to validate the patientId and hash
    const removeFromWhitelist = await transaction.removeFromWhitelist(req.body.walletAddress);
    await transaction.insertRemoveFromWhitelistDetailInDatabase(req.body.walletAddress, removeFromWhitelist.data.transaction_id, removeFromWhitelist.data.block_num, removeFromWhitelist.data.from_account, removeFromWhitelist.data.to_account)
    if (removeFromWhitelist.data.transactionStatus === true) {
      // Respond with the validation result
      res.status(200).send({
        status: true,
        code: 200,
        data: {
          message: `Removed 0x${removeFromWhitelist.data.transactionInput} address from whitelist successfully`
        }
      });
    } else {
      console.error("Execution reverted from blockchain")
      let response = {};
      response.status = false;
      response.code = 400;
      response.error = "Execution reverted from blockchain";
      // Send the error response
      res.status(400).send(response);
    }
  } catch (error) {
    // Handle any errors that occur during the validation process
    console.error("Remove from whitelist for patient has error:", error);
    // Create an error responsevalidationResult
    let response = {};
    response.status = false;
    response.code = 400;
    response.error = "Remove from whitelist for patient has failed: " + error.message;
    // Send the error response
    res.status(400).send(response);
  }
});

app.post('/getLatestPatientHash', jwtCheck, requireScope, async function (req, res) {
  if (!req.body.patientId) {
    let response = {};
    response.status = false;
    response.code = 400;
    response.error = "You must provide patientId";
    return res.status(400).send(response);
  }
  try {
    // Call the validatePatientHash function to validate the patientId and hash
    const getLatestPatientHash = await transaction.getLatestPatientHash(req.body.patientId);
    await transaction.insertGetLatestPatientHashDetailInDatabase(req.body.patientId, getLatestPatientHash.data.transaction_id, getLatestPatientHash.data.block_num, getLatestPatientHash.data.from_account, getLatestPatientHash.data.to_account)
    if (getLatestPatientHash.data.transactionStatus === true) {
      // Respond with the validation result
      res.status(200).send({
        status: true,
        code: 200,
        data: {
          latestPatientHash: getLatestPatientHash.data.transactionOutput
        }
      });
    } else {
      console.error("Execution reverted from blockchain")
      let response = {};
      response.status = false;
      response.code = 400;
      response.error = "Execution reverted from blockchain";
      // Send the error response
      res.status(400).send(response);
    }
  } catch (error) {
    // Handle any errors that occur during the validation process
    console.error("Get latest patient hash for patient has error:", error);
    // Create an error responsevalidationResult
    let response = {};
    response.status = false;
    response.code = 400;
    response.error = "Get latest patient hash for patient has failed: " + error.message;
    // Send the error response
    res.status(400).send(response);
  }
});

app.post('/getTotalPatientHash', jwtCheck, requireScope, async function (req, res) {
  if (!req.body.patientId) {
    let response = {};
    response.status = false;
    response.code = 400;
    response.error = "You must provide patientId";
    return res.status(400).send(response);
  }
  try {
    // Call the validatePatientHash function to validate the patientId and hash
    const getTotalPatientHash = await transaction.getTotalPatientHash(req.body.patientId);
    await transaction.insertGetTotalPatientHashDetailInDatabase(req.body.patientId, getTotalPatientHash.data.transaction_id, getTotalPatientHash.data.block_num, getTotalPatientHash.data.from_account, getTotalPatientHash.data.to_account)
    if (getTotalPatientHash.data.transactionStatus === true) {
      // Respond with the validation result
      res.status(200).send({
        status: true,
        code: 200,
        data: {
          totalPatientHashes: getTotalPatientHash.data.transactionOutput1,
          patientHashes: getTotalPatientHash.data.transactionOutput2
        }
      });
    } else {
      console.error("Execution reverted from blockchain")
      let response = {};
      response.status = false;
      response.code = 400;
      response.error = "Execution reverted from blockchain";
      // Send the error response
      res.status(400).send(response);
    }
  } catch (error) {
    // Handle any errors that occur during the validation process
    console.error("Get total patient hash for patient has error:", error);
    // Create an error responsevalidationResult
    let response = {};
    response.status = false;
    response.code = 400;
    response.error = "Get total patient hash for patient has failed: " + error.message;
    // Send the error response
    res.status(400).send(response);
  }
});