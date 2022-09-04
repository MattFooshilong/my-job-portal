const express = require('express')
const router = express.Router()
const cors = require('cors')
const authController = require('../controllers/authController')

// const whitelist = [
//     'http://localhost:3000'
//   ]

//   const corsOptions = {
//     origin: (origin, callback) => {
//       try {
//         if (whitelist.indexOf(origin) !== -1 || process.env.NODE_ENV == 'staging') {
//           callback(null, true)
//         } else {
//           callback(new Error('Not Allowed'), false)
//         }
//       } catch (error) {
//         console.error(error, 'error-CORS')
//       }
//     },
//     optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
//   }

router.post('/login', authController.login)

module.exports = router