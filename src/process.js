

import {ResponseModel} from './response.model';
import {AppConfig} from '../config/config';
import {ToolsHelper} from './Tools.helper';
const braintree = require('braintree');
import {SubscriptionHook} from './subscription.hook';

export class PaymentProcessor {



    //constructor accepts braintree connection gateway
    constructor(gateway, ctx){
        this.response = new ResponseModel(ctx);
        this.gateway = gateway;
        this.requestBody = ctx.request.body || {};
        this.requestParam = ctx.params || {};
        this.requestQuery = ctx.request.query || {};
    }


    /**
     * one time sale
     * @returns {Promise.<ResponseModel>}
     */
    async sale(){
        try{

            const isMissing = ToolsHelper.isMissing(this.requestBody, ['amount', 'nonce','customerId']); //require parameter
            if(isMissing){
                this.response.statusText =isMissing+' is missing';
                this.response.data = isMissing;
                this.response.status = 400;
                return this.response.response;
            }

            const body = ToolsHelper.canContain(this.requestBody, ['amount']); // acceptable parameter
            body.paymentMethodNonce=this.requestBody.nonce;
            body.customerId=this.requestBody.customerId;
            body.options = {
                submitForSettlement:true
            };
            this.response.status = 200;
            let data = await this.gateway.transaction.sale(body);
            if(!data.success){
                throw new Error(data.message)
            }
            this.response.data = data;
            this.response.statusText = data.message;
            this._debug();
            return this.response.response;
        }catch(e){
            return this._errorOccurred(e);
        }
    }


    /**
     * Generate client token
     * @returns {Promise.<ResponseModel>}
     */
    async generateToken(){
        try{
            if(!this.requestParam.id){
                this.response.status = 400;
                this.response.statusText = 'Customer is  required';
                this.response.data = {};
                return this.response.response;
            }

             const data= await this.gateway.clientToken.generate({
                    customerId: this.requestParam.id
                });
            this.response.data = data.clientToken;
            this.response.statusText = 'Success';
            this.response.status = 200;
            this._debug();
            return this.response.response;

        }catch(e){
            return this._errorOccurred(e);
        }

    }

    _errorOccurred(e) {
        this.response.status = 500;
        if (AppConfig.enableDebug) {
            this.response.data = e;
            console.log(e);

        } else {
            this.response.data = {};
        }

        this.response.statusText = 'An error occurred';
        return this.response.response;
    }

    /**
     * subscribe to a known plan
     * @returns {Promise.<*>}
     */
    async subscribe(){
        try{
            const isMissing = ToolsHelper.isMissing(this.requestBody,['nonce', 'planId', 'customerId']);

            if(isMissing) {
                this.response.statusText = isMissing + ' is required';
                this.response.status = 400;
                this.response.data = isMissing;
                return this.response.response;
            }

            if( AppConfig.availablePlan.indexOf(this.requestBody.planId) < 0 ){
                this.response.statusText = 'Invalid plan';
                this.response.status = 400;
                this.response.data = {};
                return this.response.response;
            }

            let data = await this.gateway.subscription.create({
                    paymentMethodNonce: this.requestBody.nonce,
                    planId: this.requestBody.planId
                });
            if(!data.success){
                throw new Error(data.message)
            }
            this.response.data = data.message;
            this.response.statusText = 'Success';
            this.response.status = 200;
            this._debug();
            return this.response.response;

        }catch(e){
            return this._errorOccurred(e);
        }
    }


    /**
     * create a customer on braintree server
     * @returns {Promise.<ResponseModel>}
     */
    async createCustomer(){
        try{

            let isMissing = ToolsHelper.isMissing(this.requestBody, ['firstName', 'lastName','email']);// required parameter
            if(isMissing){
                this.response.statusText = isMissing+' is required';
                this.response.status = 400;
                this.response.data = isMissing;
                return this.response.response;
            }
            const body = ToolsHelper.canContain(this.requestBody, ['firstName', 'lastName', 'company','email', 'phone','fax', 'website']); //acceptable parameters

            let data = await this.gateway.customer.create(body);
            this.response.data = data.customer.id;
            this.response.statusText = 'Success';
            this.response.status = 200;
            this._debug();
            return this.response.response;


        }catch(e){
            return this._errorOccurred(e);
        }
    }


    _debug(){

        if(AppConfig.debug){
            console.log('--------------------- WEBHOOK ACTION --------------');

            console.log(this.requestBody);
            console.log('................ REQUEST BODY ...................');


            console.log(this.requestParam);

            console.log('.............. REQUEST PARAM ..................');


            console.log(this.requestQuery);

            console.log( ' .................. REQUEST QUERY ....................');

            console.log(this.response.response);

            console.log(' ..................... Response ------------------');
        }

    }
    /**
     * Add hook for webhook notification
     * @returns {Promise.<*>}
     */
    async hook(){
        try{

            const notification = await this.gateway.webhookNotification.parse(this.requestBody.bt_signature, this.requestBody.bt_payload);


            //here notification.kind must be any of the above events eg for Subscription charged
            if(notification.kind === braintree.WebhookNotification.Kind.SubscriptionChargedSuccessfully){
                // process notification data
                const subscription = new SubscriptionHook();
                await subscription.charged(notification)
            }
            // you could add other notification kind here

            this.response.statusText = 'DONE';
            this.response.status = 200;
            this.response.data = {};
            this._debug();
            return this.response.response;

        }catch(e){

            return this._errorOccurred(e);
        }


    }

}