var express = require('express'); // Express web server framework
let bodyParser = require('body-parser');


let app = express();

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(__dirname + '/public'))

app.set('views', './views');
app.set('view engine', 'pug');


app.get('/', (request, response)=>{
	response.render('index')
});

app.post('/search', (request, response)=>{
	console.log(request.body.imageurl)
	response.send({image: request.body.imageurl})
});
		

app.listen(4000, function() {
    console.log('Listening on port 4000');
});