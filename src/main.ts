require('dotenv').config()

import inquirer from 'inquirer'
import { IgApiClient } from 'instagram-private-api'
import moment from 'moment'

import {downloadUserMediaAsync} from './lib/Instagram'

// Constants
const INSTAGRAM_USER = process.env.INSTAGRAM_USER
const INSTAGRAM_PASSWORD = process.env.INSTAGRAM_PASSWORD

if (INSTAGRAM_USER === undefined || INSTAGRAM_PASSWORD === undefined) {
    console.log('No username and/or password provided')
    process.exit(1)
}

const getDownloadConfig = async (): Promise<[string, boolean]> => {
    const questions = [
        {
            type: 'input',
            name: 'username',
            message: 'Enter an Instagram username',
            validate: function(value: string) {
                const pass = value.match(
                    /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/igm
                )
                if (pass) {
                    return true
                }

                return 'Please enter a valid Instagram username'
            }
        },
        {
            type: 'confirm',
            name: 'skipVideos',
            message: 'Skip videos?',
            default: true,
        }
    ]

    const answers = await inquirer.prompt(questions)

    const username = ((answers as any).username as string).trim()
    const skipVideos = ((answers as any).skipVideos as boolean)

    return [username, skipVideos]
}

// START EXECUTION ************************************************************
console.log("Instavous\n")

// Create instagram client
const ig = new IgApiClient()

// Generate device id with username
ig.state.generateDevice(INSTAGRAM_USER!);

(async () => {
    // Simulate pre-login
    await ig.simulate.preLoginFlow()

    // Log in
    const loggedInUser = await ig.account.login(INSTAGRAM_USER!, INSTAGRAM_PASSWORD!)

    // Simulate post-login
    process.nextTick(async () => await ig.simulate.postLoginFlow())

    // Build download config from user input
    const downloadConfig = await getDownloadConfig()
    const username = downloadConfig[0]
    const skipVideos = downloadConfig[1]

    // Download posts for provided username
    await downloadUserMediaAsync(ig, username, skipVideos)

    console.log(`\nFinished at ${moment(new Date()).format('HH:mm:ss')}!`)
})()
