require("dotenv").config();
const express = require('express');
const session = require('express-session');
const cookies = require('cookie-parser');
const methodOverride = require('method-override');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const path = require('path');
const { log } = require('./herramientas/herramientas');

const public = path.join(__dirname, '../public');
const views = path.join(__dirname, './views');

const userLoggedMiddleware = require('./middlewares/userLoggedMiddleware');

//ROUTES
const main = require('./routes/mainRoutes');
const products = require('./routes/productRoutes');
const user = require('./routes/userRoutes');
const cart = require('./routes/cartRoutes');

//Routes - APIs
const apiMain = require('./routes/api/mainRoutes');
const apiUsers = require('./routes/api/userRoutes');
const apiProducts = require('./routes/api/productRoutes');


//CONFIGURACIÓN
app.set("PUERTO", 3001);
app.set("view engine", "ejs");
app.set("views", views);

//MIDDLEWARE
app.use(express.static(public));
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(session({
    secret: "Secreto",
    resave: false,
    saveUninitialized: false
}));
app.use(cookies());
app.use(userLoggedMiddleware);
app.use(morgan('dev'));

//RUTAS
app.use('/', main);
app.use('/products', products);
app.use('/user', user);
app.use('/cart', cart);

//Rutas - APIs
app.use('/api', apiMain);
app.use('/api/users', apiUsers);
app.use('/api/products', apiProducts);

const puerto = app.get('PUERTO') || 3001;
app.listen(puerto, () => log('Servidor inicializado en localhost:' + puerto));