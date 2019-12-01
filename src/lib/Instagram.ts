import { IgApiClient } from 'instagram-private-api'
import { UserFeedResponseItemsItem } from 'instagram-private-api/dist/responses'
import moment from 'moment'

import Files from './Files'



export default class Instagram {
    public static async downloadUserMediaAsync(client: IgApiClient, username: string): Promise<void> {
        // Retrieve user information
        console.log(`Retriving info for ${username}...`)
        const userId = await client.user.getIdByUsername(username)
        const user = await client.user.info(userId)

        // Build user directory
        const userDir = Files.getDirectory(Files.getUsersFolder(), username.charAt(0).toUpperCase(), username)

        // Load media...
        console.log(`Loading media for ${user.username}...`)

        // const allItems: UserFeedResponseItemsItem[] = []
        const feed = client.feed.user(user.pk)



        const items = await feed.items();
        console.log(items[0])

        const post = items[0]
        const date = moment.unix(post.taken_at).format()
        console.log(date)
    }
}