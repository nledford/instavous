import fs from 'fs'
import path from 'path'

import emptyDir from 'empty-dir'
import { IgApiClient, UserFeed } from 'instagram-private-api'
import { 
    UserFeedResponseItemsItem,
    UserFeedResponseCarouselMediaItem,
    UserFeedResponseImage_versions2 
} from 'instagram-private-api/dist/responses'
import moment from 'moment'

import Files from './Files'

enum InstaMediaType {
    Image = 1,
    Video = 2,
    Carousel = 8,
}

const getAllItemsFromFeed = async (feed: UserFeed): Promise<UserFeedResponseItemsItem[]> => {
    let items: UserFeedResponseItemsItem[] = []
    do {
        items = items.concat(await feed.items())
    } while (feed.isMoreAvailable())
    return items
}

const toDatedFolderPath = (unixTimestamp: number): string => {
    const date = moment.unix(unixTimestamp)

    const year = date.format('YYYY')
    const month = date.format('MM')
    const day = date.format('DD')

    return path.join(year, month, day)
}

const downloadMediaAsync = async (media: UserFeedResponseCarouselMediaItem | UserFeedResponseImage_versions2) => {

}

export default class Instagram {
    public posts: any[] = []

    public static async downloadUserMediaAsync(client: IgApiClient, username: string): Promise<void> {
        // Retrieve user information
        console.log(`Retriving info for ${username}...`)
        const userId = await client.user.getIdByUsername(username)
        const user = await client.user.info(userId)

        // Build user directory
        const userDir = Files.getDirectory(Files.getUsersFolder(), username.charAt(0).toUpperCase(), username)

        // Load media...
        console.log(`Loading media for ${user.username}...`)

        const feed = client.feed.user(user.pk)
        const posts = await getAllItemsFromFeed(feed)
        console.log(`Number of posts to download: ${posts.length}`)

        const post = posts[0]
        console.log(post)

        const isCarousel = post.carousel_media_count !== undefined
        console.log(isCarousel)

        const datedDir = Files.getDirectory(userDir, toDatedFolderPath(post.taken_at))
        console.log(datedDir)
        console.log(post.carousel_media![0].image_versions2[0])

        if (isCarousel) {
            const setsDir = Files.getDirectory(datedDir, 'Sets')

            // check if sets directory is empty
            let setDir: string
            if (await emptyDir(setsDir)) {
                setDir = Files.getDirectory(setsDir, '001')
            } else {
                const numberOfDirs = fs.readdirSync(setsDir).length
                setDir = `${numberOfDirs + 1}`.padStart(3, '0')
                setDir = Files.getDirectory(setsDir, setDir)
            }

            let carousel = post.carousel_media!
            carousel.forEach((carouselItem) => {
                const takenAt = moment.unix(post.taken_at)

                switch(carouselItem.media_type) {
                    // image
                    case 1:
                        const img = carouselItem.image_versions2[0]
                }
            }) 
        }

    }
}