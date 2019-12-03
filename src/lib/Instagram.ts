import fs from 'fs'
import path from 'path'
import url from 'url'

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

const downloadMediaAsync = async (media: UserFeedResponseItemsItem, destDir: string) => {
    let mediaUrl: string

    switch (media.media_type) {
        case InstaMediaType.Image:
            mediaUrl = media.image_versions2.candidates[0].url
            break
        case InstaMediaType.Video:
            mediaUrl = media.image_versions2[0].url
            break
        case InstaMediaType.Carousel:
            return
        default:
            throw new Error(`Media type not found`)
    }

    let parsed = url.parse(mediaUrl)

    let takenAt = moment.unix(media.taken_at)

    await downloadFileAsync(parsed, media.user.username, takenAt, destDir)
}

const downloadFileAsync = async (url: url.UrlWithStringQuery, username: string, takenAt: moment.Moment, destDir: string) => {
    console.log(url)
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
        const posts = await feed.items()
        // const posts = await getAllItemsFromFeed(feed)
        console.log(`Number of posts to download: ${posts.length}`)

        for (const post of posts) {
            const isCarousel = post.carousel_media_count !== undefined
            const datedDir = Files.getDirectory(userDir, toDatedFolderPath(post.taken_at))
    
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
                for (const carouselItem of carousel) {
                    const takenAt = moment.unix(post.taken_at)
                    let parsedUrl: url.UrlWithStringQuery
    
                    switch(carouselItem.media_type) {
                        case InstaMediaType.Image:
                            parsedUrl = url.parse(carouselItem.image_versions2.candidates[0].url)
                            await downloadFileAsync(parsedUrl, user.username, takenAt, setDir)
                            break
                        case InstaMediaType.Video:
                            // must cast `carouselItem` to `any` since `video_versions` field is not present in model
                            parsedUrl = url.parse((carouselItem as any).video_versions.candidates[0].url) 
                            await downloadFileAsync(parsedUrl, user.username, takenAt, setDir)
                            break
                        case InstaMediaType.Carousel:
                            continue
                        default:
                            throw new Error("Media type not found")
                    }
                }
            } else {
                const miscDir = Files.getDirectory(datedDir, 'Misc')
                await downloadMediaAsync(post, miscDir)
            }
        }
    }
}