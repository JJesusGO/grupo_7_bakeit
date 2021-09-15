const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const user = require('../models/User');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require('moment');

//Llamado a modelos
const User = db.Usuario;


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

        // let userLogin = user.User.findByEmail(req.body.correo);

        User.findAll({
                where: {
                    correo: req.body.correo
                },
                // include: [
                //     'permiso',
                //     'imagen'
                // ],

                //include: [
                //{ model: db.Permiso, as: 'permiso' },
                //{ model: db.Imagen, as: 'imagen' }
                //],

            })
            .then((userLogin) => {
                console.log(userLogin);
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
    /*
    register: (req, res) => {
        const resultValidation = validationResult(req);

        if (resultValidation.errors.length > 0) {
            return res.render('user/register', {
                errors: resultValidation.mapped(),
                oldData: req.body
            });
        }

        let emailRegistered = user.User.findByEmail(req.body.correo);

        if (emailRegistered) {
            return res.render('user/register', {
                errors: {
                    correo: {
                        msg: 'Este correo ya se encuentra registrado'
                    }
                },
                oldData: req.body
            });
        }

        let newUser = user.User.createUser(req.body, req.file);
        res.redirect('/user/login');
    },
    */
    resetPassword: (req, res) => {
        res.render('user/resetPassword');
    },

    //CRUD
    add: function(req, res) {
        res.render('user/register');

    },
    create: function(req, res) {
        db.Imagen.create({
            url: req.file.filename,
        }).then((imagen) => {
            console.log(imagen.id);
            User.create({
                permiso_id: 1,
                nombre: req.body.nombre,
                apellidos: req.body.apellido,
                fecha_nacimiento: req.body.fechaNacimiento,
                correo: req.body.correo,
                contrasena: bcrypt.hashSync(req.body.contrasena, 10),
                imagen_id: imagen.id
            }); //.then((newUser) => {
            res.redirect("/user/login");
        })
    },
    edit: function(req, res) {
        User.findByPk(req.params.id)
            .then((usuario) => {
                return res.render('user/profileUpdate', { usuario: usuario });
            })

    },
    //Trabajando en este metodo
    update: function(req, res) {
        User.update({
                nombre: req.body.nombre,
                apellidos: req.body.apellido,
                fecha_nacimiento: req.body.fechaNacimiento,
                correo: req.body.correo
                    // imagen: req.file.filename
            }, {
                where: { id: req.params.id }
            })
            .then((updatedUser) => {
                console.log(updatedUser);
                return res.redirect('user/profile', { usuario: updatedUser });
            })
            .catch(error => res.send(error))


    },
    detail: function(req, res) {
        User.findByPk(req.params.id)
            .then(function(usuario) {
                return res.render('user/profile', { usuario: usuario });
            })
    },

};

module.exports = controller;