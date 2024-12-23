const axios = require('axios');

function getMinimalExchangeAmount(exchange_name, fromCurrency, toCurrency) {

    if(exchange_name === "majesticbank") {
        const ExchangeFunctionsMajesticBank = require("@mymonero/mymonero-exchange-majesticbank")
        this.exchangeFunctions = new ExchangeFunctionsMajesticBank()

       return new Promise((resolve, reject) => {
            this.exchangeFunctions.getRatesAndLimits(fromCurrency, toCurrency)
                .then((response) => {
                    // emulating the response from ChangeNow
                    resolve({"data": {"in_min": response.data["limits"][fromCurrency].min}})
                }).catch((error) => {
                    reject(error)
                })
        })
    }

  let self = this;
  return new Promise((resolve, reject) => {
    this.apiUrl = "https://api.mymonero.com:443/cx";
      let data = {
          "in_currency": fromCurrency,
          "out_currency": toCurrency
      }
      let endpoint = `${this.apiUrl}/get_info`;
      axios.post(endpoint, data)
          .then((response) => {
              self.currentRates = response.data;
              self.in_currency = fromCurrency;
              self.out_currency = toCurrency;
              self.currentRates.minimum_xmr = self.currentRates.in_min;
              self.currentRates.maximum_xmr = self.currentRates.in_max;
              resolve(response);
          }).catch((error) => {
              reject(error);
          })
  });
}

// function getMinimalExchangeAmount(fromCurrency, toCurrency) {
//   return new Promise((resolve, reject) => {
//     this.apiUrl = "https://api.changenow.io/v2/";  
//     var axios = require('axios');
//     var config = {
//         method: 'get',
//         url: `${this.apiUrl}exchange/min-amount`,
//         params: {
//             fromCurrency,
//             fromNetwork: "",
//             toCurrency,
//             toNetwork: "",
//             flow: "standard"
//         },
//         headers: { 
//             'x-changenow-api-key': ``
//         }
//     };

//     axios(config).then(function (response) {
//         resolve(response.data);
//     })
//     .catch(function (error) {
//         console.log(error);
//         reject(error)
//     });
//   })
// }

function validateOutAddress(currencyTickerCode, address) {

    // This is the type of response ChangeNow provides
    // For simplicity, we will use this response even when checks are done locally
    const successfulResponse = {
        "isActivated": null,
        "result": true,
        "message": "Valid address. (Local checks passed)."
    }

    const failedResponse = {
        "isActivated": null,
        "result": false,
        "message": "Invalid address. (Failed local checks)."
    }

  // We use regex to validate the address locally for currencies unsupported by ChangeNow
  if(currencyTickerCode === "WOW") {
    return new Promise((resolve, reject) => {
        // Wownero addresses are 97 characters long
        // start with W followed by 96 base58 characters
        regex = /^W[1-9A-HJ-NP-Za-km-z]{96}$/
        if(regex.test(address)){
            resolve(successfulResponse)
        }
        reject(failedResponse)
    })
  }
  else if (currencyTickerCode === "FIRO"){
    return new Promise((resolve, reject) => {
        // Firo addresses either:
        // start with a followed by 33 base58 characters (transparent address)
        // or start with firos followed by 94 base58 characters (shielded address)
        regex = /^(a[1-9A-HJ-NP-Za-km-z]{33}|firos[1-9A-HJ-NP-Za-km-z]{94})$/
        if(regex.test(address)){
            resolve(successfulResponse)
        }
        reject(failedResponse)
    })
  }

  return new Promise((resolve, reject) => {
      this.apiUrl = "https://api.changenow.io/v2/";  
      var axios = require('axios');
      console.log("Running validate address");
      var config = {
          method: 'get',
          url: `${this.apiUrl}validate/address`,
          params: {
              currency: currencyTickerCode,
              address
          },
          headers: { }
      };

      axios(config).then(function (response) {                
          resolve(response.data);
      })
      .catch(function (error) {
          reject(error)
      });
  })
}

function sendFunds (wallet, xmr_amount, xmr_send_address, sweep_wallet, validation_status_fn, handle_response_fn) {
  return new Promise((resolve, reject) => {
    // for debug, we use our own xmr_wallet and we send a tiny amount of XMR. Change this once we can send funds

    const enteredAddressValue = xmr_send_address // ;
    const resolvedAddress = ''
    const manuallyEnteredPaymentID = ''
    const resolvedPaymentID = ''
    const hasPickedAContact = false
    const manuallyEnteredPaymentID_fieldIsVisible = false
    const resolvedPaymentID_fieldIsVisible = false
    const resolvedAddress_fieldIsVisible = false
    let contact_payment_id
    let cached_OAResolved_address
    let contact_hasOpenAliasAddress
    let contact_address
    const raw_amount_string = xmr_amount // XMR amount in double
    const sweeping = sweep_wallet
    const simple_priority = 1

    wallet.SendFunds(
      enteredAddressValue,
      resolvedAddress,
      manuallyEnteredPaymentID,
      resolvedPaymentID,
      hasPickedAContact,
      resolvedAddress_fieldIsVisible,
      manuallyEnteredPaymentID_fieldIsVisible,
      resolvedPaymentID_fieldIsVisible,
      contact_payment_id,
      cached_OAResolved_address,
      contact_hasOpenAliasAddress,
      contact_address,
      raw_amount_string,
      sweeping,
      simple_priority,
      validation_status_fn,
      cancelled_fn,
      handle_response_fn
    )

    function cancelled_fn () { // canceled_fn
      // TODO: Karl: I haven't diven deep enough to determine what state would invoke this function yet
    }
  })
}

// end of functions to check Bitcoin address

function renderOrderStatus (order) {
    // TODO - MajesticBank - ensure order statuses match this schema
  /*

        "btc_amount",
        "btc_amount_partial",
        "btc_dest_address",
        "btc_num_confirmations_threshold",
        "created_at",
        "in_amount_remaining",
        "out_amount",
        "status",
        "expires_at",
        "incoming_amount_total",
        "incoming_num_confirmations_remaining",
        "incoming_price_btc",
        "receiving_subaddress",
        "recommended_mixin",
        "remaining_amount_incoming",
        "seconds_till_timeout",
        "state",
        "uses_lightning",
        "uuid"
        "provider_order_id"

*/

  const idArr = [
    'in_amount_remaining',
    'out_amount',
    'status',
    'expires_at',
    'provider_order_id',
    'in_address',
    'in_amount'
  ]

  const test = document.getElementById('exchangePage')
  if (!(test == null)) {
    idArr.forEach((item, index) => {
      if (item == 'in_address') {
        document.getElementById('receiving_subaddress').innerHTML = order[item]
      } else {
        document.getElementById(item).innerHTML = order[item]
      }
    })
  }
}

function getTimeRemaining (endtime) {
  const total = Date.parse(endtime) - Date.parse(new Date())
  let seconds = Math.floor((total / 1000) % 60)
  let minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))

  if (total < 0) {
    seconds = 0
    minutes = 0
  }

  return {
    total,
    days,
    hours,
    minutes,
    seconds
  }
}

function checkDecimals (value, decimals) {
  const str = value.toString()
  const strArr = str.split('.')
  if (strArr.length > 1) {
    if (strArr[1].length >= decimals) {
      return false
    }
  }
  return true
}

function isValidBase10Decimal (number) {
  const str = number.toString()
  const strArr = str.split('.')
  if (strArr.size > 1 && typeof (strArr) === Array) {
    return false
  }
  for (let i = 0; i < 2; i++) {
    if (isNaN(parseInt(strArr[i]))) {
      return false
    }
  }
  if (strArr.size > 1) {
    if (strArr[1].length == 0) {
      return false
    }
  }
  return true
}

module.exports = { validateOutAddress, getTimeRemaining, isValidBase10Decimal, checkDecimals, renderOrderStatus, sendFunds, getMinimalExchangeAmount }
