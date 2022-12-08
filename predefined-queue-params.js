const facebook = {
    queue_name: 'facebook',
    process_options: {
        concurrency: 1
    }
}

const instagram = {
    queue_name: 'instagram',
    process_options: {
        concurrency: 1
    }
}

const linkedin = {
    queue_name: 'linkedin',
    process_options: {
        concurrency: 1
    }
}

const twitter = {
    queue_name: 'twitter',
    process_options: {
        concurrency: 1
    }
}

/** predefined queue params for each platform/channel */
module.exports = [
    facebook,
    instagram,
    linkedin,
    twitter
]