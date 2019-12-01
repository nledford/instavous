require('dotenv').config()

import { IgApiClient } from 'instagram-private-api'
import moment from 'moment'

import Instagram from './lib/Instagram'

console.log("Instavous\n")

// set up constants
const username = process.env.INSTAGRAM_USER!
const password = process.env.INSTAGRAM_PASSWORD!

const account = 'shanimarie_nsb'

// create instagram client
const ig = new IgApiClient()

// generate device id with username
ig.state.generateDevice(username);

(async () => {
    // Simulate pre-login
    await ig.simulate.preLoginFlow()

    // Log in
    const loggedInUser = await ig.account.login(username, password)

    // Simulate post-login
    process.nextTick(async () => await ig.simulate.postLoginFlow())

    // begin downloading user photos
    await Instagram.downloadUserMediaAsync(ig, account)

    console.log(`\nFinished at ${moment(new Date()).format()}`)
})()
