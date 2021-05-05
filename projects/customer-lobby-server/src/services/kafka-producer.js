import * as dotenv from 'dotenv';
import { Kafka } from 'kafkajs'
/**
 * Kafka Producer
 */
dotenv.config();

const kafkaHost = process.env.KAFKA_HOST || 'kafka:9092';// 'localhost:9092';
const clientId = process.env.KAFKA_CLIENT_ID || 'admin_lobby_server';

export async function kafkaPublish(topic, message) {
    const kafka = new Kafka({
        clientId: clientId,
        brokers: [kafkaHost]
    })

    const producer = kafka.producer()

    await producer.connect()

    await producer.send({
        topic: topic,
        messages: [
            {
                value: message
            }
        ]
    })

    await producer.disconnect()
}