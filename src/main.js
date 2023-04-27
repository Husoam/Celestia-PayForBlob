import { SigningCosmosClient } from '@cosmjs/launchpad'
import { assertIsBroadcastTxSuccess, SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
export const Axios = axios.create({
    baseURL: 'http://localhost:26659/submit_pfb',
    withCredentials: true
})
//import { assertIsBroadcastTxSuccess, SigningStargateClient } from '@cosmjs/stargate'

window.onload = async () => {
    // Keplr extension injects the offline signer that is compatible with cosmJS.
    // You can get this offline signer from `window.getOfflineSigner(chainId:string)` after load event.
    // And it also injects the helper function to `window.keplr`.
    // If `window.getOfflineSigner` or `window.keplr` is null, Keplr extension may be not installed on browser.
    if (!window.getOfflineSigner || !window.keplr) {
        alert("Please install keplr extension");
    } else {
        if (window.keplr.experimentalSuggestChain) {
            try {
                // Keplr v0.6.4 introduces an experimental feature that supports the feature to suggests the chain from a webpage.
                // cosmoshub-3 is integrated to Keplr so the code should return without errors.
                // The code below is not needed for cosmoshub-3, but may be helpful if you’re adding a custom chain.
                // If the user approves, the chain will be added to the user's Keplr extension.
                // If the user rejects it or the suggested chain information doesn't include the required fields, it will throw an error.
                // If the same chain id is already registered, it will resolve and not require the user interactions.
                await window.keplr.experimentalSuggestChain({
                    // Chain-id of the Osmosis chain.
                    chainId: "blockspacerace",
                    // The name of the chain to be displayed to the user.
                    chainName: "Blockspace Race Testnet",
                    // RPC endpoint of the chain. In this case we are using blockapsis, as it's accepts connections from any host currently. No Cors limitations.
                    rpc: "https://rpc-blockspacerace.pops.one",
                    // REST endpoint of the chain.
                    rest: "https://api-blockspacerace.pops.one",
                    // Staking coin information
                    stakeCurrency: {
                        // Coin denomination to be displayed to the user.
                        coinDenom: "TIA",
                        // Actual denom (i.e. uatom, uscrt) used by the blockchain.
                        coinMinimalDenom: "utia",
                        // # of decimal points to convert minimal denomination to user-facing denomination.
                        coinDecimals: 6,
                        // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
                        // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                        coinGeckoId: "celestia"
                    },
                    // (Optional) If you have a wallet webpage used to stake the coin then provide the url to the website in `walletUrlForStaking`.
                    // The 'stake' button in Keplr extension will link to the webpage.
                    // walletUrlForStaking: "",
                    // The BIP44 path.
                    bip44: {
                        // You can only set the coin type of BIP44.
                        // 'Purpose' is fixed to 44.
                        coinType: 118,
                    },
                    // Bech32 configuration to show the address to user.
                    // This field is the interface of
                    // {
                    //   bech32PrefixAccAddr: string;
                    //   bech32PrefixAccPub: string;
                    //   bech32PrefixValAddr: string;
                    //   bech32PrefixValPub: string;
                    //   bech32PrefixConsAddr: string;
                    //   bech32PrefixConsPub: string;
                    // }
                    bech32Config: {
                        bech32PrefixAccAddr: "celestia",
                        bech32PrefixAccPub: "celestia" + "pub",
                        bech32PrefixValAddr: "celestia" + "valoper",
                        bech32PrefixValPub: "celestia" + "valoperpub",
                        bech32PrefixConsAddr: "celestia" + "valcons",
                        bech32PrefixConsPub: "celestia" + "valconspub"
                    },
                    // List of all coin/tokens used in this chain.
                    currencies: [{
                        // Coin denomination to be displayed to the user.
                        coinDenom: "TIA",
                        // Actual denom (i.e. uatom, uscrt) used by the blockchain.
                        coinMinimalDenom: "utia",
                        // # of decimal points to convert minimal denomination to user-facing denomination.
                        coinDecimals: 6,
                        // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
                        // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                        // coinGeckoId: "celestia"
                    }],
                    // List of coin/tokens used as a fee token in this chain.
                    feeCurrencies: [{
                        // Coin denomination to be displayed to the user.
                        coinDenom: "TIA",
                        // Actual denom (i.e. uosmo, uscrt) used by the blockchain.
                        coinMinimalDenom: "utia",
                        // # of decimal points to convert minimal denomination to user-facing denomination.
                        coinDecimals: 6,
                        // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
                        // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                        // coinGeckoId: "celestia"
                    }],
                    // (Optional) The number of the coin type.
                    // This field is only used to fetch the address from ENS.
                    // Ideally, it is recommended to be the same with BIP44 path's coin type.
                    // However, some early chains may choose to use the Cosmos Hub BIP44 path of '118'.
                    // So, this is separated to support such chains.
                    coinType: 118,
                    // (Optional) This is used to set the fee of the transaction.
                    // If this field is not provided, Keplr extension will set the default gas price as (low: 0.01, average: 0.025, high: 0.04).
                    // Currently, Keplr doesn't support dynamic calculation of the gas prices based on on-chain data.
                    // Make sure that the gas prices are higher than the minimum gas prices accepted by chain validators and RPC/REST endpoint.
                    gasPriceStep: {
                        low: 0.01,
                        average: 0.025,
                        high: 0.04
                    }
                });
            } catch {
                alert("Failed to suggest the chain");
            }
        } else {
            alert("Please use the recent version of keplr extension");
        }
    }

    const chainId = "blockspacerace";

    // You should request Keplr to enable the wallet.
    // This method will ask the user whether or not to allow access if they haven't visited this website.
    // Also, it will request user to unlock the wallet if the wallet is locked.
    // If you don't request enabling before usage, there is no guarantee that other methods will work.
    await window.keplr.enable(chainId);

    const offlineSigner = window.getOfflineSigner(chainId);

    // You can get the address/public keys by `getAccounts` method.
    // It can return the array of address/public key.
    // But, currently, Keplr extension manages only one address/public key pair.
    // XXX: This line is needed to set the sender address for SigningCosmosClient.
    const accounts = await offlineSigner.getAccounts();

    // Initialize the gaia api with the offline signer that is injected by Keplr extension.
    const cosmJS = new SigningCosmosClient(
        "https://rpc-blockspacerace.pops.one",
        accounts[0].address,
        offlineSigner,
    );

  
};

//const namespace = document.getElementById("namespace");
//const data = document.getElementById("data");
//const submit = document.getElementById("save");



	let loginForm = document.getElementById("loginForm");
	
	loginForm.addEventListener("submit", (e) => {
	e.preventDefault();
	
	let namespace = document.getElementById("namespace");
	let data = document.getElementById("data");
	 if (namespace.value == "" || data.value == "") {
    alert("Ensure you input a value in both fields!");
  } else {
    // perform operation with form input
    alert("This form has been successfully filled! Please wait a moment for processing...");
    console.log(
      `This form has a namespace of ${namespace.value} and data of ${data.value}`
    );
  }
	const postdata = {
	  "namespace_id": namespace.value,
      "data": data.value,
	  "gas_limit": 80000, 
	  "fee": 2000
	}

	const axios = require('axios');

  axios.post('http://143.42.50.231:8010/proxy/submit_pfb', postdata ,
  
  {
    headers: {
      'Content-Type': 'text/plain'
    }
  }
).then((response) => { 
	  const resp = response.data;
	  const tx = (resp.txhash);
	  const height = (resp.height);
	  const txresp = ("TX: "+resp.txhash);
	  alert(txresp);
	  alert("Do you want to check via https://testnet.mintscan.io/ on explorer by click ok?")
	  var txcheck = "https://testnet.mintscan.io/celestia-incentivized-testnet/txs/"+tx+"?height="+height
	  var redirectWindow = window.open(txcheck, '_blank');
		redirectWindow.location
      location.reload();
    }).catch((error) => {
    // handle error
	//if (error.response) {
        // The client was given an error response (5xx, 4xx)
        console.log(error.response);
		const err = error.response
		const code = (err.status);
		const msg = (err.statusText);
		console.log(error.response);
		alert("Status Code: "+code+" "+msg+'\n'+"Please try again...");
		location.reload();
    //}  else {
        // Anything else
    //console.log(error);
	});
	//});
	return false;
});



        
