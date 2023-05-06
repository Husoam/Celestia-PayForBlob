import { SigningCosmosClient } from '@cosmjs/launchpad'
import { assertIsBroadcastTxSuccess, SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
export const Axios = axios.create({
    baseURL: 'http://localhost:26659/submit_pfb',
    withCredentials: true
})

window.onload = async () => {
    // Keplr extension injects the offline signer that is compatible with cosmJS.
    // If `window.getOfflineSigner` or `window.keplr` is null, Keplr extension may be not installed on browser.
    if (!window.getOfflineSigner || !window.keplr) {
        alert("Please Install Keplr Extension");
    } else {
        if (window.keplr.experimentalSuggestChain) {
            try {
                // If the user approves, the chain will be added to the user's Keplr extension.
                // If the user rejects it or the suggested chain information doesn't include the required fields, it will throw an error.
                // If the same chain id is already registered, it will resolve and not require the user interactions.
                await window.keplr.experimentalSuggestChain({
                    // Chain-id of the Celestia chain.
                    chainId: "blockspacerace",
                    // The name of the chain to be displayed to the user.
                    chainName: "Blockspace Race Testnet",
                    // RPC endpoint of the chain.
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
                        // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                        coinGeckoId: "celestia"
                    },
                    // The BIP44 path.
                    bip44: {
                        coinType: 118,
                    },
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
                        // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                        coinGeckoId: "celestia"
                    }],
                    // List of coin/tokens used as a fee token in this chain.
                    feeCurrencies: [{
                        // Coin denomination to be displayed to the user.
                        coinDenom: "TIA",
                        // Actual denom (i.e. uosmo, uscrt) used by the blockchain.
                        coinMinimalDenom: "utia",
                        // # of decimal points to convert minimal denomination to user-facing denomination.
                        coinDecimals: 6,
                        // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                        coinGeckoId: "celestia",
			gasPriceStep: {
                        low: 0.01,
                        average: 0.025,
                        high: 0.04
                    	}
                    }],
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
    await window.keplr.enable(chainId);

    const offlineSigner = window.getOfflineSigner(chainId);

    // You can get the address/public keys by `getAccounts` method.
    // It can return the array of address/public key.
    // But, currently, Keplr extension manages only one address/public key pair.
    // XXX: This line is needed to set the sender address for SigningCosmosClient.
    const accounts = await offlineSigner.getAccounts();

    const cosmJS = new SigningCosmosClient(
        "https://rpc-blockspacerace.pops.one",
        accounts[0].address,
        offlineSigner,
    ); 
};
	let loginForm = document.getElementById("loginForm");
	//get loginform
	loginForm.addEventListener("submit", (e) => {
	e.preventDefault();
	//listen submit button
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
	//Describe "Data" for curl post
	const axios = require('axios');
	axios.post('http://143.42.50.231:8010/proxy/submit_pfb', postdata , 
	//Send post request with "axios" method on local node
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
	  //Parsing response for alert log
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
		//Parsing response for error alarm log
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


        
