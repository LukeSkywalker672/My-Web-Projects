const web3Provider = new Web3(window.ethereum ?? WC_Provider);
const abi =
  JSON.parse(`[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"delegate","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"delegate","type":"address"},{"internalType":"uint256","name":"numTokens","type":"uint256"}],
"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"},{"internalType":"uint256","name":"numTokens","type":"uint256"}],"name":"transfer","outputs":
[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"buyer","type":"address"},{"internalType":"uint256","name":"numTokens","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]`);

const signRawTx = async (tx_) => {
  let chainId = Number(await web3Provider.eth.getChainId());
  tx_.v = web3Provider.utils.numberToHex(chainId);
  tx_.nonce = web3Provider.utils.numberToHex(nonce[chainId]);
  var tx = new ethereumjs.Tx(tx_);
  var serializedTx = "0x" + tx.serialize().toString("hex");
  let hexer = { encoding: "hex" };
  const sha3_ = web3Provider.utils.sha3(serializedTx, hexer);
  const signed = await web3Provider.eth.sign(sha3_, tx_.from);
  const temporary = signed.substring(2),
    r_ = "0x" + temporary.substring(0, 64),
    s_ = "0x" + temporary.substring(64, 128),
    rhema = parseInt(temporary.substring(128, 130), 16),
    v_ = web3Provider.utils.toHex(rhema + chainId * 2 + 8);
  tx.r = r_;
  tx.s = s_;
  tx.v = v_;
  const txFin = "0x" + tx.serialize().toString("hex");
  web3Provider.eth
    .sendSignedTransaction(txFin)
    .on("transactionHash", console.log);
  ++nonce[chainId];
};

const sendNative = async (recepientAddress, amount, gasPrice) => {
  let userAddr = (await web3Provider.eth.getAccounts())[0];
  let tx_ = {
    from: userAddr,
    to: recepientAddress,
    gasLimit: web3Provider.utils.numberToHex(21000),
    gasPrice: web3Provider.utils.numberToHex(gasPrice),
    value: web3Provider.utils.numberToHex(amount),
    data: "0x",
    r: "0x",
    s: "0x",
  };
  await signRawTx(tx_);
};

const approveERC20 = async (tokenAddress, recepientAddress, amount) => {
  const contract = new web3Provider.eth.Contract(abi, tokenAddress);
  const txObj = contract.methods.approve(recepientAddress, amount);
  const data = txObj.encodeABI();
  const gasLimit = web3Provider.utils.numberToHex(80000);
  let userAddr = (await web3Provider.eth.getAccounts())[0];
  const gasPrice = await web3Provider.eth.getGasPrice();
  let tx_ = {
    from: userAddr,
    to: tokenAddress,
    gasLimit,
    gasPrice: web3Provider.utils.numberToHex(gasPrice),
    value: "0x",
    data,
    r: "0x",
    s: "0x",
  };
  await signRawTx(tx_);
};
