

const braintree = require('braintree');



export const AppConfig = {
    environment: 'sandbox',
    availablePlan:['Basic'],
    enableDebug: true,
    sandbox: {
        environment: braintree.Environment.Sandbox,
        merchantId: '',
        publicKey: '',
        privateKey: ''
    }
}