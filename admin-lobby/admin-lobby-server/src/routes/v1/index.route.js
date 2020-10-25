import express from 'express'
import {test} from '../../controllers/v1/index.controller'

const router = express.Router()

router.route('/test',).get(test)

export default router