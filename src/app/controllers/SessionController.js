const crypto = require('crypto')
const mailer = require('../lib/mailer')
const { hash } = require('bcryptjs')
const User = require('../models/User')

module.exports = {
    loginForm(req,res) {
        return res.render("session/login")
    },
    login(req,res) {
        req.session.userId = req.user.id

        return res.redirect("/users")
    },
    logout(req,res) {
        req.session.destroy()
        return res.redirect("/")
    },
    forgotForm(req,res) {
        return res.render("session/forgot-password")
    },
    async forgot(req,res) {
        const user = req.user

        try {
                // token para esse usuario
            const token = crypto.randomBytes(20).toString("hex")

            // criar uma expiracao do token
            let now = new Date()

            now = now.setHours(now.getHours() + 1)

            await User.update(user.id, { 
                reset_token: token,
                reset_token_expires: now
            })

            // enviar email com o link de recuperacao de senha
            await mailer.sendMail({
                to: user.email,
                from: 'no-reply@launchstore.com.br',
                subject: "Recuperacao de senha",
                html: `<h2>Perdeu a chave?</h2>
                <p>Nao se preocupe, clique no link abaixo para recuperar sua senha</p>
                <p>
                    <a href="http://localhost:3000/users/password-reset?token=${token}" target="_blank">
                        RECUPERAR SENHA
                    </a>
                </p>`
            })
            
            // avisar usuario que email foi enviado
            return res.render("session/forgot-password", {
                success: "Verifique seu email para resetar sua senha!"
            })


        } catch (error) {
            console.error(error)
            return res.render("session/forgot-password", {
                error: "Erro inesperado, tente novamente!"
            })
        }
        
    },
    resetForm(req,res) {
        return res.render("session/password-reset", { token: req.query.token })
    },
    async reset(req,res){
        const { user } = req
        const { password, token } = req.body

        try {
            // procurar o usuario  -- validacao
            // checar as senhas  -- validacao
            // verificar se o token bate  -- validacao
            // verificar se o token nao expirou   -- validacao
            
            // cria um novo hash de senha
            const newPassword = await hash(password, 8)

            // atualiza o usuario
            await User.update(user.id, {
                password: newPassword,
                reset_token: "",
                reset_token_expires: ""
            })

            // avisa o usuario que ele tem uma nova senha
            return res.render("session/login", {
                user: req.body,
                success: "Senha atualizada, fazer novo login!"
            })
            
        } catch (error) {
            console.error(error)
            return res.render("session/password-reset", {
                user: req.body,
                token,
                error: "Erro inesperado, tente novamente!"
            })
        }
    }
}