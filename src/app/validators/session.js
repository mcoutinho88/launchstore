const User = require('../models/User')
const { compare } = require('bcryptjs')


async function login(req,res, next) {
    const { email, password } = req.body

    const user = await User.findOne({
        where: { email }
    })

    if(!user) return res.render("session/login", { 
        user: req.body,
        error: "Usuario nao cadastrado!" })
    
    const passed = await compare(password, user.password)

    if(!passed) return res.render("session/login", {
        user:req.body,
        error: "Senha incorreta"
    })

    req.user = user

    next()
}


async function forgot(req, res, next) {
    const { email } = req.body

    try {

        let user = await User.findOne({
            where: { email }
        })
    
        if(!user) return res.render("session/forgot-password", { 
            user: req.body,
            error: "Email nao cadastrado!" })

        req.user = user

        next()
    } catch (error) {
        console.error(error)
    }
}

async function reset(req,res, next){

     // procurar o usuario 
    const { email, password, passwordRepeat, token } = req.body

    const user = await User.findOne({
        where: { email }
    })

    if(!user) return res.render("session/password-reset", { 
        user: req.body,
        token,
        error: "Usuario nao cadastrado!" })
    
    // checar as senhas  -- validacao
    if (password != passwordRepeat) return res.render("session/password-reset", {
        user: req.body,
        token,
        error: "Senhas devem ser iguais"
    })


    // verificar se o token bate  -- validacao
    if (token != user.reset_token) return res.render("session/password-reset", {
        user: req.body,
        token,
        error: "Token invalido! Solicite uma nova recuperacao de senha"
    })

    // verificar se o token nao expirou   -- validacao
    let now = new Date()            
    now = now.setHours(now.getHours())

    if(now > user.reset_token_expires) return res.render("session/password-reset", {
        user: req.body,
        token,
        error: "Token expirado! Favor solicite uma nova recuperacao de senha"
    })

    req.user = user
    next()
}

module.exports = { 
   login,
   forgot,
   reset
}