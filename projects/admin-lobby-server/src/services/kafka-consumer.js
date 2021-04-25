import * as dotenv from 'dotenv'
import { Kafka } from 'kafkajs'
dotenv.config()

const kafkaHost = process.env.KAFKA_HOST || 'kafka:9092';//'localhost:9092';

const kafka = new Kafka({
    clientId: `customer_lobby_server`,
    brokers: [kafkaHost]
})

const consumer = kafka.consumer({
    groupId: process.env.KAFKA_GROUP
})

export async function kafkaSubscribe(topic, send) {

    await consumer.connect()
    await consumer.subscribe({
        topic: topic,
        fromBeginning: true
    })

    await consumer.run({
        eachMessage: async ({ topic, partition, message}) => {
            //send(message)
            send(message.value.toString())
        }
    })
}

export async function kafkaDisconnect() {
    if(consumer !== undefined) {
        console.log("start disconnecting...")
        await consumer.disconnect()
        console.log("disconnected from kafka...")
    }
}