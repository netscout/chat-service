require("dotenv").config();

const test = (req, res, next) => 
    res.json({
        message: 'Hello world!'
    })

export {
    test
}