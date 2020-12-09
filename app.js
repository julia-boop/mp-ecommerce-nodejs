var express = require('express');
var exphbs  = require('express-handlebars');
var port = process.env.PORT || 3000;
const mercadopago = require('mercadopago');

mercadopago.configure({
    access_token:'APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398',
    integrator_id:'dev_24c65fb163bf11ea96500242ac130004'
})

var app = express();
 
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static('assets'));
 
app.use('/assets', express.static(__dirname + '/assets'));


app.get('/', function (req, res) {
    res.render('home');
});

app.get('/detail', function (req, res) {
    let query = req.query
    res.render('detail', {query:query});
});

app.get('/callback', function(req, res){

    if(req.query.status.includes('success')){
        res.render('success', {
            payment_type : req.query.payment_type,
            external_reference : req.query.external_reference,
            collection_id : req.query.collection_id
        })
    }

    if(req.query.status.includes('pending')){
        res.render('pending')
    }

    if(req.query.status.includes('failure')){
        res.render('failure')
    }

    return res.status(404).end()

})

app.post('/webhooks', function(req, res){

    console.log('webhooks:', req.body)
    res.status(200).send(req.body)

})

app.post('/buy', function(req, res){

    const host = 'https://certificacion-m.herokuapp.com/'

    const url = 'callback?status='

    let preference = {

        back_urls:{

            success: host + url + 'success',
            pending: host + url + 'pending',
            failure: host + url + 'failure'

        },

        notification_url: 'https://certificacion-m.herokuapp.com/webhooks',

        auto_return:'approved',

        payer: {
            name: 'Lalo',
            surname: 'Landa',
            email: 'test_user_63274575@testuser.com',
            phone: {
                area_code: '11',
                number: 22223333,
            },
            address: {
                street_name: 'False',
                street_number: 123,
                zip_code: '1111'
            }
        },

        payment_methods: {
            excluded_payment_methods: [
                {id: 'amex'}//No permito American Express
            ],
            excluded_payment_types: [
                {id:'atm'}//No permito pagos en cajeros automaticos
            ],
            installments: 6//cantidad máxima de cuotas.
        },

        items:[

            {

            id:'1234',
            title: req.body.title,
            description:'Dispositivo móvil de Tienda e-commerce',
            picture_url:'https://certificacion-m.herokuapp.com/assets/003.jpg',
            quantity:1,
            unit_price: Number(req.body.price)

            }

        ],

        external_reference:'crdr.jc@gmail.com'

    }

    mercadopago.preferences.create(preference)
    .then(function(response){
        global.init_point = response.body.init_point
        res.render('confirm', {global})
        console.log(response)
    })
    .catch(function(e){
        console.log(e)
        res.send(e)
    })

})

app.listen(port);