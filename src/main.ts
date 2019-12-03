require('dotenv').config()

import inquirer from 'inquirer'
import { IgApiClient } from 'instagram-private-api'
import moment from 'moment'

import Instagram from './lib/Instagram'

console.log("Instavous\n")

// set up constants
const INSTAGRAM_USER = process.env.INSTAGRAM_USER
const INSTAGRAM_PASSWORD = process.env.INSTAGRAM_PASSWORD

if (INSTAGRAM_USER === undefined || INSTAGRAM_PASSWORD === undefined) {
    console.log('No username and/or password provided')
    process.exit(1)
}

// const account = 'shanimarie_nsb'

const getUsername = async () => {
    const questions = [
        {
            type: 'input',
            name: 'username',
            message: 'Enter an Instagram username:'
        },
    ]

    const answers = await inquirer.prompt(questions)

    return ((answers as any).username as string).trim()
}

// create instagram client
const ig = new IgApiClient()

// shanimarie_nsb
// monicapaulette

// generate device id with username
ig.state.generateDevice(INSTAGRAM_USER!);

(async () => {
    // Simulate pre-login
    await ig.simulate.preLoginFlow()

    // Log in
    const loggedInUser = await ig.account.login(INSTAGRAM_USER!, INSTAGRAM_PASSWORD!)

    // Simulate post-login
    process.nextTick(async () => await ig.simulate.postLoginFlow())

    const username = await getUsername()

    // begin downloading user photos
    await Instagram.downloadUserMediaAsync(ig, username)

    console.log(`\nFinished at ${moment(new Date()).format()}`)
})()
