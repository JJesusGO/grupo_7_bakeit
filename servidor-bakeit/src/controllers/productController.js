const controlador = {

    getDetail: (req, res) => {
        res.render('productDetail');
    },

    getCart: (req, res) => {
        res.render('productCart');
    }

};


module.exports = controlador;