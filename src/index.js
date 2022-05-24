const express = require('express');
const bodyParser = require('body-parser');
const route = require('./route/route.js');
const { default: mongoose } = require('mongoose');
const app = express();
const multer = require('multer')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(multer().any())

mongoose.connect('mongodb+srv://mraykwar99:LvIVaS9x3LyxfoQV@cluster0.1d2my.mongodb.net/Project5?retryWrites=true&w=majority',{useNewurlParser:true})
.then( () => console.log("mongoDb is connected"))
.catch(err => console.log(err));

app.use('/', route);

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});