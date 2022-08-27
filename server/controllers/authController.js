const jwt = require('jsonwebtoken')

const adminCredentials = {
    email: 'admin@gmail.com',
    password: 'Abc123!'
}
exports.login = (req, res) => {
    if (req.body.email !== adminCredentials.email || req.body.password !== adminCredentials.password) {
        res.status(400).send({
            message: 'Wrong password'
        })
        return
    }
    const token = jwt.sign({
        id: 1,
        role: 'admin',
        emailAddr: req.body.email,
    }, process.env.JWT_SECRET || 'sad2q31233Q@@3', {
        algorithm: 'HS256',
        expiresIn: '7d'
    })
    res.status(200).send({
        token,
        message: 'Login successful'
    })
}