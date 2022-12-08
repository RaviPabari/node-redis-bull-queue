const { add_job_to_queue, remove_job_from_queue } = require("./helpers")
const generated_queues = require('./predefined-queue-params')

async function test() {
    const queue_names = Object.keys(generated_queues)
    let counter = 1000
    for (q of queue_names) {
        const job_data = {
            test: 'this is test',
            action: 'this is the function I want to execute', // pass in actual function name
            queue_name: q
        }
        const job_params = {
            delay: 3000,
            priority: 1
        }
        const job = await add_job_to_queue(q, job_data, job_params)
        counter += 1000
        // uncomment below line to test remove job functionality 
        // await remove_job_from_queue(q, job.id)
    }
}

setTimeout(test, 3000)