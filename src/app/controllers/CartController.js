const LoadProductService = require('../services/LoadProductService')
const Cart = require('../lib/cart')

module.exports = { 
    async index(req, res) {
        try {

            let { cart } = req.session

            // gerenciador de carrinho
            cart = Cart.init(cart)

            return res.render("cart/index", { cart })

        }
        catch(err){
            console.error(err)
        }
    },
    async addOne(req, res) {
        // pegar o id do produto e o produto
        const { id } = req.params

        const product = await LoadProductService.load('product', { where: { id }})

        // pegar o carrinho da sessao
        let { cart } = req.session

        // adicionar o produto ao carrinho (usando nosso gerenciador de carrinho)
        cart = Cart.init(cart).addOne(product)
        
        // atualizar o carrinho da sessao
        req.session.cart = cart

        // redirecionar o usuario para a tela do carrinho
        return res.redirect('/cart')
    },
    async removeOne(req,res) {
        // pegar o id do produto
        let { id } = req.params

        // pegar o carrinho da sessao
        let { cart } = req.session

        // se nao tiver carrinho, retornar
        if(!cart) return res.redirect('/cart')
        
        // iniciar o carrinho (gerenciador)
        cart = Cart.init(cart).removeOne(id)

        // atualizar o carrinho da sessao, removendo 1 item
        req.session.cart = cart

        // redirecionamento para a pagina cart
        return res.redirect('/cart')
    },
    delete(req,res) {
        let { id } = req.params

        let { cart } = req.session

        if(!cart) return

        cart = Cart.init(cart).delete(id)

        req.session.cart = cart

        return res.redirect('/cart')
    }
}