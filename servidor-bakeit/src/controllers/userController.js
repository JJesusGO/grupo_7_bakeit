const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../database/models');

//Llamado a modelos
const Usuario = db.Usuario;

const controller = {
    getLogin: (req, res) => {
        res.render('user/login');
    },

    getRegister: (req, res) => {
        res.render('user/register');
    },

    login: (req, res) => {
        const resultValidation = validationResult(req);

        if (resultValidation.errors.length > 0) {
            return res.render('user/login', {
                errors: resultValidation.mapped(),
                oldData: req.body
            });
        }
        Usuario.findOne({
                where: {
                    correo: req.body.correo
                },
                include: ['permiso', 'imagen', 'carritos'],
            })
            .then((userLogin) => {
                if (userLogin) {
                    let passCompare = bcrypt.compareSync(req.body.contrasena, userLogin.contrasena);
                    if (passCompare) {
                        delete userLogin.contrasena;
                        req.session.usuarioLoggeado = userLogin;
                        if (req.body.recordar)
                            res.cookie('id', userLogin.id, { maxAge: (1000 * 60) * 2 });
                        return res.redirect('/')
                    }
                    return res.render('user/login', {
                        errors: {
                            contrasena: {
                                msg: 'Contraseña incorrecta'
                            }
                        },
                        oldData: req.body
                    });
                }
                return res.render('user/login', {
                    errors: {
                        correo: {
                            msg: 'El correo ingresado no se encuentra registrado'
                        }
                    },
                    oldData: req.body
                });
            })
            .catch(error => res.send(error))
    },

    logout: (req, res) => {
        req.session.usuarioLoggeado = null;
        res.clearCookie('id');
        res.redirect('/');
    },
 
    resetPassword: (req, res) => {
        res.render('user/resetPassword');
    },

    updatePassword: (req, res) => {
        res.render('user/login');
    },


    //CRUD
    add: function(req, res) {
        res.render('user/register');

    },

    create: function(req, res) {
        const resultValidation = validationResult(req);
        let errors = 0;
        Usuario.findOne({
            where: {
                correo: req.body.correo
            },
            include: ['permiso', 'imagen', 'carritos'],
        })
        .then((userLogin) => {
            if (resultValidation.errors.length > 0) {
                errors++;
                return res.render('user/register', {
                    errors: resultValidation.mapped(),
                    oldData: req.body
                })
            } 
            else if (userLogin !== null && userLogin.correo == req.body.correo) {
                errors++;
                return res.render('user/register', {
                    errors: {
                        correo: {
                            msg: 'Este correo ya se encuentra registrado'
                        }
                    },
                    oldData: req.body
                });
             }
        }).then(() => {            
            if (errors == 0){
                db.Imagen.create({
                    url: req.file.filename,
                }).then((imagen) => {
                    Usuario.create({
                        permiso_id: 2,
                        nombre: req.body.nombre,
                        apellidos: req.body.apellido,
                        fecha_nacimiento: req.body.fechaNacimiento,
                        correo: req.body.correo,
                        contrasena: bcrypt.hashSync(req.body.contrasena, 10),
                        imagen_id: imagen.id
                    }); 
                res.redirect("/user/login");
                }).catch(error => res.send(error))
            }
        }) 
    },
        
    edit: function(req, res) {
        Usuario.findByPk(req.params.id)
            .then((usuario) => {
                return res.render('user/profileUpdate', { usuario: usuario });
            })

    },
    update: function(req, res) {        
        Usuario.update({
                nombre: req.body.nombre,
                apellidos: req.body.apellido,
                fecha_nacimiento: req.body.fechaNacimiento,
                correo: req.body.correo
                    // imagen: req.file.filename
            }, {
                where: { id: req.params.id },
                returning: true
            })
            .then((updateStatus) => {                
                return res.redirect('/user/detail/' + req.params.id);
            })
            .catch(error => res.send(error))

    },
    detail: function(req, res) {
        if (req.session.usuarioLoggeado)
            Usuario.findByPk(req.params.id, {
                include: ["permiso", "imagen"]
            })
            .then(function(usuario) {
                return res.render('user/profile', { usuario: usuario });
            })
        else
            return res.redirect('/');

    },

};

module.exports = controller;