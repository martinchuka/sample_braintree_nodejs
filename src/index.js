
const router = new (require('koa-router'))();
import {AppConfig} from '../config/config';
const braintree = require('braintree');
import {PaymentProcessor} from '../src/process';

const gateway = braintree.connect(AppConfig.sandbox);

/**
 * generate client token to get nonce
 */
router.get('/api/token/:id', async (ctx, next) =>{
    let payment = new PaymentProcessor(gateway, ctx);
    ctx.body = await payment.generateToken();
});

/**
 * create a customer
 */

router.post('/api/customer', async (ctx, next) =>{
    let payment = new PaymentProcessor(gateway, ctx);
    ctx.body = await payment.createCustomer();
});


/**
 * webhook
 */


router.post('/api/hook', async (ctx, next) =>{
    let payment = new PaymentProcessor(gateway, ctx);
    ctx.body = await payment.hook();
});



/**
 * One time purchase with nonce
 */
router.post('/api/sale' , async (ctx, next) =>{
    let payment = new PaymentProcessor(gateway, ctx);
    ctx.body = await payment.sale();
});


/**
 * Subscription with nonce
 */
router.post('/api/subscribe', async (ctx, next) =>{
    const payment = new PaymentProcessor(gateway, ctx);
    ctx.body = await payment.subscribe();
});


module.exports =router;