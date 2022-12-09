/**
 * Internal helper functions
 */
// const functions  = require() // uncomment and import the real functions here
/** This functions are the bull queue's job functions -> job.action*/
const functions = {} // comment this in case you want to execute real functions

/**
 * Third party libraries
 */
const BullQueue = require('bull')
require('dotenv').config()



/** Initial setup */

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
}

/** This will track the actual Bull queue object for each newly created queue */
const generated_queues = {}

/**
 * Producer 
 ** Adds new job inside particular queue.
 * @param {string} queue_name bull queue name
 * @param {object} job_data (optional) data we want to receive back when the job is ready to be consumed. `default = {}`
 * @param {object} options (optional) processing params passed while adding the job. `default = {}`
 ** example- `{ delay: 5000, priority: 2, lifo/fifo: true}`
 * @param {string} process_name (optional) the queue process. `default = __default__` 
 * @returns {object} newly created job
 */
const add_job_to_queue = async (queue_name, job_data = {}, options = {}, process_name = '__default__') => {
    try {
        console.log("\n\n Job added", job_data, options, '\n\n\n\n---------------')
        //This is imported here to avoid circular dependency
        const { generated_queues } = require('./index')
        const queue = generated_queues[queue_name]
        if (!queue) throw new Error(`Queue ->${queue_name}<- does not exists`)
        const new_job = await queue.add(process_name, job_data, options)
        return new_job
    } catch (err) {
        err.scope = 'add_job_to_queue'
        throw err
    }
}

/**
 * Removes job from a particular queue.
 * @param {string} queue_name bull queue name
 * @param {integer} job_id unique job id
 * @param {object} job (optional) actual job object by default it will be null
 * @returns 
 */
const remove_job_from_queue = async (queue_name, job_id) => {
    try {
        if (!job_id) throw new Error('Job id not provided!!')
        //This is imported here to avoid circular dependency
        const { generated_queues } = require('./index')
        const queue = generated_queues[queue_name]
        if (!queue) throw new Error(`Queue ->${queue_name}<- does not exists`)
        job = await queue.getJob(job_id)
        await job.remove()
        console.log('\n\n removing job -', job.id, `from ${queue_name}`)
        return
    } catch (err) {
        err.scope = 'remove_job_from_queue'
        throw err
    }
}

/**
 * Executes the function which was passed in the Job data.action
 * @param {object} data Job's data object which was passed when job was added.
 * @returns void promise
 */
const process_job_action = async (data) => {
    return new Promise((resolve, reject) => {
        try {
            if (data?.action && typeof functions[data.action] === 'function') {
                functions[data.action](data)
            }
            resolve()
        } catch (err) {
            err.scope = 'process_job_action'
            reject(err)
            throw err
        }
    })
}

/**
 * Consumer
 ** Sets the process handler for a particular queue, this process handler will be responsible
 * for consuming the incoming job poped from redis.
 * @param {object} queue actual bull queue object
 * @param {string} queue_name bull queue name
 * @param {integer} concurrency (optional) defines how many jobs will be executed in parallel. `default = 1`
 * @param {string} process_name (optional) the queue process. `default = __default__` 
 */
const set_queue_process_handler = async (queue, queue_name, concurrency = 1, process_name = '__default__') => {
    try {
        if (!queue) throw new Error(`queue ->${queue_name}<- is not, set!!`)
        queue.process(process_name, concurrency, async (job, done) => {
            console.log('Processing JOB ---->', job?.id, ` from ${queue_name}\n\n`)
            if (job?.data) await process_job_action(job.data)
            done(null, 'completed')
        })
        console.log(`process handler set for the queue ->${queue_name}<-`)
    } catch (err) {
        err.scope = 'set_queue_process_handler'
        throw err
    }
}

module.exports = {
    add_job_to_queue,
    remove_job_from_queue,
    set_queue_process_handler
}
