

/*
 * MIT License
 *
 * Copyright (c) 2019 Martin Chuka
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const dropIn = {
    data: {
        host: 'http://127.0.0.1:2228',
        submitBtn: null,
        paymentInstance: null,
        customerId: null,
        dropInWrapper: null,
        token: null,
        msgContainer: null,
        customerForm: null,
        planId: 1
    },
    setup(){
        dropIn.data.submitBtn=$('#submit-button');
        dropIn.data.customerForm = $('.customer-form');
        dropIn.data.msgContainer = $('.msg-notification');
        dropIn.data.dropInWrapper = $('#dropin-wrapper');
        dropIn.data.dropInWrapper.hide();
    },
    _api(type,url,data,success, failure){
        console.log(type);
        console.log(url);
        console.log(data);
        $.ajax({
            type: type,
            url: dropIn.data.host+url,
            data:data
        }).done((result)=>{
            console.log(result);
            if(result.status>=200 && result.status< 300){
                success(result.data);
            }else{
                dropIn.data.msgContainer.html(result.statusText);
                if(failure){
                    failure(result);
                }
            }
        })
    },
    create() {
        dropIn.data.customerForm.hide();
        braintree.dropin.create({
            authorization: dropIn.data.token,
            container: '#dropin-container'
        }, (createErr, instance) => {
            if(createErr){
                console.error(createErr);
                return;
            }
            dropIn.data.paymentInstance = instance;
            dropIn.addListeners();
        });
    },
    createCustomer(){
        dropIn._api('POST','/api/customer',{
            firstName: $('#firstname').val(),
            lastName: $('#lastname').val(),
            email: $('#email').val()
        },(result)=>{
            dropIn.data.customerId = result;
            dropIn.data.msgContainer.html('<h1>Success</h1><p>Customer has been created</p>');
            dropIn.generateToken();
        });
    },
    generateToken(){

        dropIn._api('GET','/api/token/'+dropIn.data.customerId,{},(result)=>{
            dropIn.data.token = result;
            dropIn.data.msgContainer.html('<h1>Success</h1><p>Your Token is set. You can now make a transaction!.</p>');
            dropIn.data.dropInWrapper.show();
            dropIn.create();

        });
    },
    _teardown(){
        dropIn.data.paymentInstance.teardown(function (teardownErr) {
            if (teardownErr) {
                console.error('Could not tear down Drop-in UI!');
            } else {
                console.info('Drop-in UI has been torn down!');
                // Remove the 'Submit payment' button
                $('#dropin-container').html('');
                dropIn.data.dropInWrapper.hide();
                dropIn.data.customerForm.show();
                dropIn.data.paymentInstance = null;
            }
        });
    },
    createSales(nonce){
        let options = {
             nonce,
            customerId: dropIn.data.customerId
        };
        let url = '/api/sale';
        if($('#paymentType').val()==='subscription'){
            options.planId = dropIn.data.planId;
            url = '/api/subscribe';
        }else{
            options.amount = $('#paymentAmount').val();
        }
        dropIn._api('POST', url ,options,(result)=>{
                dropIn.data.msgContainer.html('Transaction successful');
                dropIn._teardown();
            });
    },
    addListeners(){
        dropIn.data.submitBtn.on('click', () =>{
            dropIn.data.paymentInstance.requestPaymentMethod((requestPaymentMethodError, payload) =>{
                dropIn.createSales(payload.nonce);
            })
        })
    }
}