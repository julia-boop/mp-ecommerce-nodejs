var express = require('express');
var exphbs  = require('express-handlebars');
var port = process.env.PORT || 3000
const mercadopago = require('mercadopago');

mercadopago.configure({
    access_token:'APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398',
    integrator_id:'dev_24c65fb163bf11ea96500242ac130004'
})

var app = express();
 
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('assets'));
 
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/detail', function (req, res) {
    res.render('detail', req.query);
});

app.post('/buy', function(req, res){

    const host = 'http://localhost:3000/'

    const url = 'callback?status='

    let preference = {

        // back_urls:{

        //     success: url + 'success',
        //     pending: url + 'pending',
        //     failure: url + 'failure'

        // },

        payment_methods:{

            payer:{

                name:'Lalo',
                surname:'Landa',
                email:'test_user_63274575@testuser.com',
                phone:{
                    area_code:'11',
                    number:'22223333'
                },
                address:{
                    zip_code:'1111',
                    street_name:'False',
                    street_number:123
                }

            },

            excluded_payment_methods: [

                {id:'visa'}
    
            ],
    
            excluded_payment_types: [
    
                {id:'atm'}
    
            ],
    
            installments: 6

        },

        items:[

            {

            id:'1234',
            title:req.query.title,
            description:'Dispositivo móvil de Tienda e-commerce',
            picture_url:req.query.img,
            quantity:Number(req.query.unit),
            unit_price:Number(req.query.price)

            }

        ],

        external_reference:'crdr.jc@gmail.com'

    }

    mercadopago.preferences.create(preference)
    .then(function(response){
        global.init_point = response.body.init_point
        res.render('confirm')
    })
    .catch(function(e){
        res.send(e)
    })

})

app.listen(port);