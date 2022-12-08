/**
 * Internal helper functions/libs
 */
const { set_queue_process_handler } = require('./helpers');
/** predefined queue params for each platform/channel */
const predefined_queues = require('./predefined-queue-params')

/**
 * Third party libs/functions
 */
require('dotenv').config()
const BullQueue = require('bull');


// if redis creds not set in env exit the process
if (!process.env.REDIS_PASSWORD || !process.env.REDIS_HOST || !process.env.REDIS_PORT) {
    console.log('\n\nPlease configure redis creds first.\n\n')
    process.exit()
}

/** Redis creds from env for connection */
const REDIS_CREDS = {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
};

/** This will track the actual Bull queue object for each newly created queue */
const generated_queues = {};

/**
 * IIFE
 ** Creates new queues from predefined_queues array.
 ** Sets the process handler for newly created queues.
 */
(async function () {
    try {
        for (current_queue of predefined_queues) {
            const Queue = new BullQueue(current_queue.queue_name, { redis: REDIS_CREDS })
            generated_queues[current_queue.queue_name] = Queue
            set_queue_process_handler(
                Queue,
                current_queue.queue_name,
                current_queue.process_options.concurrency
            )
            // set this flag true, future aspects.  just in case we needed 
            // to create dynamic queues, there we will need to check first for a queue if
            // the process handler is set or not.
            // current_queue.process_handler_set = true
        }
    } catch (err) {
        err.scope = 'bull-queue-IIFE'
        throw err
    }
})()

module.exports = {
    generated_queues
}