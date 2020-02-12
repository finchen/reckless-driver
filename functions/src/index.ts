import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

admin.initializeApp(functions.config().firebase);

const cors = require('cors')({ origin: true });


//const stripe = require('stripe')(functions.config().stripe.testkey)
const stripe = require('stripe')(functions.config().stripe.livekey)

const opennode = require('opennode');

const opennodeKey = '6e78fbc6-5283-47b1-b932-e2b2849a373d';
//opennode.setCredentials('98b4f2a4-6ffd-40cb-adcf-9f65d2fc3868', 'dev');
opennode.setCredentials('6e78fbc6-5283-47b1-b932-e2b2849a373d');

// Called once payment accepted. Frontend create that entry on stripe callback
exports.stripeCharge = functions.database
    .ref('/payments/{userId}/{paymentId}')
    .onWrite((change, event) => {

        const payment = change.after.val();
        const userId = event.params.userId;
        const paymentId = event.params.paymentId;

        let balance = 0;

        // checks if payment exists or if it has already been charged
        if (!payment || payment.charge) return;

        return admin.database()
            .ref(`/users/${userId}`)
            .once('value')
            .then(snapshot => {
                return snapshot.val();
            })
            .then(customer => {

                balance = (customer !== null ? customer.balance : 0);

                const amount = payment.amount;
                const idempotency_key = paymentId;  // prevent duplicate charges
                const source = payment.token.id;
                const currency = 'nzd';
                const charge = { amount, currency, source };


                return stripe.charges.create(charge, { idempotency_key });

            })

            .then(charge => {
                if (!charge) return;

                const updates: any = {}
                updates[`/payments/${userId}/${paymentId}/charge`] = charge;

                // If successful charge, increase user balance
                if (charge.paid) {
                    balance += charge.amount;
                    updates[`/users/${userId}/balance`] = balance;
                }

                // Run atomic update
                return admin.database().ref().update(updates);
            })


    });

// test locally:  openNodeCharge({json: true, body: {data: {amount: 2, currency: 'USD', userId: '1'}}})
exports.openNodeCharge = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        
        // test with https://htlc.me/
        return opennode.createCharge({
            amount: request.body.data.amount,
            currency: request.body.data.currency,
            description: "Reckless Driver Report",
            callback_url: `https://us-central1-bad-driver-f70d1.cloudfunctions.net/openNodeCallback?userId=${request.body.data.userId}`,
            success_url: "https://recklessdriver.co.nz/home?message=pok", 
            auto_settle: false
        }).then((charge: any) => {

            // TODO no user id and use charge.id as REF
            // save payment request
            admin.firestore()
                .collection(`cryptopayment`)
                .doc(request.body.data.userId)
                .collection(`payments`)
                .doc(charge.id)
                .set(charge).then(() => console.log('Successfuly created')).catch(err => console.error('Error while creating crypto payment')); // not really necessary

            const data = {
                id: charge.id,
                ln: charge.lightning_invoice,
                btc: charge.chain_invoice
            };

            // return to client only the payment address
            response.status(200).send({ data: data });
            }).catch((error: any) => {
                console.error(error);
                response.end();
        });
    })
});

// test locally:  openNodeCallback({json: true, body: {id: 'b1367f4f-ddaa-4f25-818e-7d5c5b53008e', status: 'paid'}})
exports.openNodeCallback = functions.https.onRequest((request, response) => { 
    cors(request, response, () => {

        const userId = request.params.userId;

        const crypto = require('crypto');
        const charge = request.body; // https://developers.opennode.co/docs/charges

        const received = charge.hashed_order;
        const calculated = crypto.createHmac('sha256', opennodeKey).update(charge.id).digest('hex');

        if (received === calculated && charge.status === 'paid') {
            //Signature is valid and paid

            let balance = 0;

            return admin.database()
                .ref(`/users/${userId}`)
                .once('value')
                .then(snapshot => {
                    return snapshot.val();
                })
                .then(customer => {

                    balance = (customer !== null ? customer.balance : 0);
                    balance += charge.amount;
                    console.log('set balance to ', balance);

                    const updates: any = {}
                    updates[`/users/${userId}/balance`] = balance;

                    // Run atomic update
                    return admin.database().ref().update(updates);

                }).then(() => {
                    console.log('save payment');
                    const doc = admin.firestore().doc(`/cryptopayment/${userId}/payments/${charge.id}`);
                    return doc.update({ status: charge.status });
                }).then(() => {
                    console.log('save charge');
                    const doc = admin.firestore().doc(`/cryptopayment/${userId}/payments/${charge.id}`);
                    return doc.collection('charges').add(charge);
                }).then(() => {
                    response.status(200).send({ data: true });
                }).catch((error: any) => {
                    return response.send(error);
                });
        }
        else {
            //Signature is invalid. Ignore.
            return response.send('Signature is invalid');
        }

    })
});

exports.newUser = functions.auth.user().onCreate((user) => {
    const userId = user.uid;

    // create user data record (where we save extra user data)
    const doc = admin.firestore().doc(`/users/${userId}`)
    doc.set({ uid: userId }).then(() => console.log('Successfuly created user data')).catch(err => console.error('Error while creating user data')); // not really necessary

    // add $5 to the balance
    const updates: any = {};
    updates[`/users/${userId}/balance`] = 500;

    // Run atomic update
    return admin.database().ref().update(updates);
});

// TODO one for openaplr simple proxy

// My collection is called "reports"
const reportRef = functions.firestore.document('reports/{reportId}')
// My counter is allocated in `/counters/reports`, maybe you wanna follow this structure instead: https://firebase.google.com/docs/firestore/solutions/counters

// Perform an increment when report is added
module.exports.incrementIncomesCounter = reportRef.onCreate(event => {
    const counterRef = event.ref.firestore.doc('counters/reports')

    counterRef.get()
        .then(documentSnapshot => {
            const currentCount = documentSnapshot.exists ? documentSnapshot.get('count') : 0

            counterRef.set({
                count: Number(currentCount) + 1
            })
            .then(() => {
                console.log('Incomers counter increased!')
            }).catch((error) => {
                console.error(error);
            });
        }).catch((error) => {
            console.error(error);
        });
});

// Perform an decrement when report is deleted
module.exports.decrementIncomesCounter = reportRef.onDelete(event => {
    const counterRef = event.ref.firestore.doc('counters/reports')

    counterRef.get()
        .then(documentSnapshot => {
            const currentCount = documentSnapshot.exists ? documentSnapshot.get('count') : 0

            counterRef.set({
                count: Number(currentCount) - 1
            })
                .then(() => {
                    console.log('Incomers counter decreased!')
                }).catch((error) => {
                    console.error(error);
                });
        }).catch((error) => {
            console.error(error);
        });
});

// https://us-central1-bad-driver-f70d1.cloudfunctions.net/countReports
exports.countReports = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        const counterRef = admin.firestore().doc('counters/reports')
        counterRef.get().then(documentSnapshot => {
            const currentCount = documentSnapshot.exists ? documentSnapshot.get('count') : 0

            response.status(200).send({ data: { count: currentCount }});
        }).catch((error) => {
            return response.send(error);
        });
        
    })

 });


exports.openalpr = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        console.log('Query:', req.query);
        console.log('Body:', req.body);

        // TODO secure with token
        // https://stackoverflow.com/questions/43238611/secure-http-trigger-for-cloud-functions-for-firebase/43239529#43239529

        let url = `https://api.openalpr.com/v2/recognize_bytes?recognize_vehicle=1&country=nz&secret_key=sk_cc272d4eb7c5ef943e4864e0`

        console.log('Request:', url);

        fetch(url, {
            method: req.method,
            body: req.get('content-type') === 'application/json' ? JSON.stringify(req.body) : req.body,
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then( (r: any) => r.headers.get('content-type') === 'application/json' ? r.json() : r.text())
        .then( (body: any) => res.status(200).send(body))
        .catch((error) => {
            return res.send(error);
        });
    });
});

// // Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
// https://us-central1-bad-driver-f70d1.cloudfunctions.net/helloWorld
//
exports.helloWorld = functions.https.onRequest((request, response) => {

    cors(request, response, () => {
        response.status(200).send({ data: 'Hello from Firebase' });
    })

 });
