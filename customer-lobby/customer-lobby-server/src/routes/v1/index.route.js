import express from 'express'
import {test, connect} from '../../controllers/v1/index.controller'

const router = express.Router()

router.route('/test').get(test)

router.route('/connect').post(connect)

export default router