const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');

// Configuração do multer para upload de imagem
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

const upload = multer({ storage: storage }).single('image');

// Rota para adicionar usuário
router.post('/add', upload, (req, res) => {
    // Verificar se todos os campos obrigatórios estão presentes
    if (!req.body.nome || !req.body.time || !req.body.pais || !req.file) {
        return res.status(400).send('Todos os campos são obrigatórios');
    }

    const user = new User({
        nome: req.body.nome,
        time: req.body.time,
        pais: req.body.pais,
        image: req.file.filename,
    });

    user.save()
        .then(result => {
            req.session.message = {
                type: 'success',
                message: 'Usuário adicionado com sucesso.'
            };
            res.redirect('/');
        })
        .catch(error => {
            req.session.message = {
                type: 'error',
                message: 'Erro ao adicionar usuário. Por favor, tente novamente.'
            };
            res.redirect('/');
        });
});

// Rota para listar usuários
router.get("/", (req, res) => {
    User.find()
        .then(users => {
            res.render('index', {
                title: 'Home Page',
                users: users
            });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

// Rota para renderizar o formulário de adição de usuário
router.get("/add", (req, res) => {
    res.render("add_users", { title: "Add Users" });
});

// Rota para renderizar o formulário de edição de usuário
router.get('/edit/:id', (req, res) => {
    const id = req.params.id;
    User.findById(id)
        .then(user => {
            if (!user) {
                // Se o usuário não for encontrado, redirecione ou exiba uma mensagem de erro
                res.redirect('/');
            } else {
                // Se o usuário for encontrado, renderize a view de edição de usuário passando o objeto user
                res.render('edit_users', {
                    title: 'Edit User',
                    user: user, // Passando o objeto user para a view
                });
            }
        })
        .catch(err => {
            console.error(err);
            res.redirect('/');
        });
});

// atualizando o user route
router.post("/update/:id", upload, (req, res) => {
    let id = req.params.id;
    let new_image = '';

    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync('./uploads/' + req.body.old_image);
        } catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }

    User.findByIdAndUpdate(id, {
        nome: req.body.nome,
        time: req.body.time,
        pais: req.body.pais,
        image: new_image,
    })
        .then(result => {
            req.session.message = {
                type: 'success',
                message: 'Jogador atualizado com sucesso'
            };
            res.redirect('/');
        })
        .catch(err => {
            res.status(500).json({
                message: err.message,
                type: 'danger'
            });
        });
});

// apagando jogadores
router.get('/delete/:id', (req, res) => {
    let id = req.params.id;
    User.findByIdAndDelete(id)
        .then(result => {
            if (result && result.image !== '') {
                try {
                    fs.unlinkSync('./uploads/' + result.image);
                } catch (err) {
                    console.log(err);
                }
            }
            req.session.message = {
                type: 'info',
                message: 'Jogador apagado com sucesso!'
            };
            res.redirect('/');
        })
        .catch(err => {
            res.status(500).json({ message: err.message });
        });
});


module.exports = router;
