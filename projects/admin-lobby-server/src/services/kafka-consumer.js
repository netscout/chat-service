import * as dotenv from 'dotenv'
import { Kafka } from 'kafkajs'
import logger from "../libs/logger";
dotenv.config()

const kafkaHost = process.env.KAFKA_HOST || 'kafka:9092';//'localhost:9092';
const clientId = process.env.KAFKA_CLIENT_ID || 'admin_lobby_server';

const kafka = new Kafka({
    clientId: clientId,
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
        logger.log("info","start disconnecting...")
        await consumer.disconnect()
        logger.log("info","disconnected from kafka...")
    }
}