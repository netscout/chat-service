require("dotenv").config();
import { getValue, setValue, delKey } from "../../services/redis-connector"
import logger from "../../libs/logger";

const test = (req, res, next) => 
    res.json({
        message: 'Hello world!'
    })

const connect = async (req, res, next) => {
    const id = req.body.id
    logger.log('info',`${id} connected.`)

    let users
    let data = await getValue("users")

    logger.log('info',data)

    //레디스의 데이터를 배열로 변환
    if(data) {
        users = JSON.parse(data)
    }

    //데이터가 비어있는 경우 새로 추가
    if(!users) {
        users = [id]
    }
    //데이터에 유저가 없는 경우 추가
    else if(!users.includes(id)) {
        users.push(id)
    }

    await setValue("users", JSON.stringify(users))

    res.json({
        result: users.length
    })
}

export {
    test,
    connect
}