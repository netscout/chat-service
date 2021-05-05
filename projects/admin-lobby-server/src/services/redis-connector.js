import bluebird from "bluebird"
import redis from "redis"

bluebird.promisifyAll(redis)

const redis_host = process.env.REDIS_HOST || "localhost"

const client = redis.createClient({
    host: redis_host,
    port: 6379
});
const pwd = process.env.REDIS_PWD || "votmdnjem"
client.auth(pwd)

client.on('connect', function() {
    console.log('Redis client connected')
})

client.on('error', (err) => {
    console.log(`redis error: ${err}`)
})

export async function getValue(key) {
    let result = await client
        .getAsync(key)
        .then((res) => {
            return res
        })

    return result
}

export async function setValue(key, value) {
    await client
        .setAsync(key, value)
        .then((res) => {

        })
}

export async function setMultiValues(key, values) {
    await client
        .hmsetAsync("key", ...values)
        .then((res) => {
            
        })
}

export async function delKey(key) {
    await client
        .delAsync(key)
        .then((res) => {

        })
}

export async function getKeys(query) {
    let result = await client
        .keysAsync(query)
        .then((res) => {
            return res
        })
    
    return result
}

// export function closeConnection() {
//     client.end(true);
// }

// async function validateToken(token) {
//     let key = `${rootURL}:${token}:USER_INFO`;
//     let isTokenValid = false;

//     if(redisClient === null) {
//         //if (process.env.NODE_ENV === "development")
//         if (process.env.NODE_ENV === "production" ||
//             process.env.NODE_ENV === "staging")
//         {
//             redisClient = redis.createClient({
//                 host: config.redisHost,
//                 port: config.redisPort,
//                 no_ready_check: true,
//                 auth_pass: config.redisAuthPass,
//                 tls: {servername: config.redisHost}
//             });
//         }
//         else {
//             redisClient = redis.createClient({
//                 host: config.redisHost,
//                 port: config.redisPort,
//                 no_ready_check: true,
//                 auth_pass: config.redisAuthPass
//             });
//         }

//         redisClient.on('connect', function() {
//             console.log('Redis client connected');
//         });
//         redisClient.on("error", function (err) {
//             console.log("Redis Error " + err);
//         });
//     }

//     console.log("before");
    
//     let result = await redisClient
//         .getAsync(key)
//         .then(function(res) {
//             if(res)
//             {
//                 isTokenValid = true;
//             }
//             console.log(`Token is ${isTokenValid ? "valid" : "invalid"}`);

//             //redisClient.quit();

//             return res;
//         });

//     console.log("after");
//     // var value = redisClient.get(key, function(err, reply) {
//     //     if(reply)
//     //     {
//     //         isTokenValid = true;
//     //     }
//     //     console.log(`Token is ${isTokenValid ? "valid" : "invalid"}`);

//     //     //redisClient.quit();

//     //     return reply;
//     // });

//     return isTokenValid;
// }