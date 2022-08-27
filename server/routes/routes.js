const express = require('express')
const router = express.Router()
const cors = require('cors')

const authController = require('../controllers/authController')

// For Cors
const whitelist = [
    'http://localhost:3000'
]


const corsAllowAll = {
    origin: '*',
    methods: 'POST',
    preflightContinue: false,
    optionsSuccessStatus: 204
}


// ==================== Auth ====================
router.post('/user/login', cors(corsAllowAll), authController.login)
//router.post('/user/logout', cors(corsOptions), authController.logout)


module.exports = router