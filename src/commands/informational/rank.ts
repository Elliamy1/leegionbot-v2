import { Help, Config, IExecuteArgs, MessageEmbed } from "discord.js"
import { Levels } from '../../db/models'
import { levels } from '../../utils'

import { createCanvas, loadImage } from 'canvas'

const WIDTH = 500
const HEIGHT = 150
const URL = 'https://static-cdn.jtvnw.net/jtv_user_pictures/c7791112-72e9-440c-b945-70e9b4b609f2-profile_banner-480.png'

const BANNER = {
  x: 200,
  y: 20,
  dx: 500,
  dy: 150,
}

const AVATAR = {
  x: 565,
  y: 30,
  dx: 100,
  dy: 100,
  radius: 50
}

const help: Help = {
  name: "rank",
  category: "Informational",
  description: "Displays a User's chat rank.",
  usage: "rank",
  example: ['rank']
}

const configs: Config = {
  permissions: [
    'SEND_MESSAGES'
  ]
}

export class Rank {

  public static async run({
    message
  }: IExecuteArgs) {

    const { guild, channel, author } = message
    if (!guild) return

    const userLevel = await Levels.fetchUserData(guild.id, author.id)

    const level = userLevel ? levels.findIndex(l => l > userLevel.exp) - 1 : 0
    const totalExp = userLevel ? userLevel.exp : 0
    const prevExp = levels[level]
    const expLim = levels[level + 1]

    const remainder = totalExp - prevExp

    const canvas = createCanvas(WIDTH, HEIGHT)
    const ctx = canvas.getContext('2d')

    const image = await loadImage(URL)

    // Background
    ctx.drawImage(image, BANNER.x, BANNER.y, BANNER.dx, BANNER.dy, 0, 0, WIDTH, HEIGHT)

    // Shaded backdrop
    ctx.roundedRect(10, 10, WIDTH - 20, HEIGHT - 20, 5)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
    ctx.fill()

    // Avatar border
    const gradient = ctx.createLinearGradient(75, 75, 110, 110)
    gradient.addColorStop(0, 'rgba(186, 85, 211, 1.0')
    gradient.addColorStop(1, 'rgba(0, 255, 255, 1.0')
    ctx.save()
    ctx.beginPath()
    ctx.arc(75, 75, AVATAR.radius + 5, 0, 2 * Math.PI, false)
    ctx.clip()
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 150, 150)
    ctx.restore()

    // Avatar background
    ctx.roundedRect(25, 25, AVATAR.radius * 2, AVATAR.radius * 2, AVATAR.radius * 2)
    ctx.fillStyle = '#ffff'
    ctx.fill()


    // Avatar
    const avatarImage = await loadImage(author.displayAvatarURL({ format: 'png' }))
    const aCanvas = createCanvas(100, 100)
    const aCtx = aCanvas.getContext('2d')

    aCtx.drawImage(avatarImage, 0, 0, 100, 100)
    aCtx.drawImage(aCanvas, 0, 0, 100, 100)

    ctx.save()
    ctx.beginPath()
    ctx.arc(75, 75, AVATAR.radius, 0, 2 * Math.PI, false)
    ctx.clip()
    ctx.drawImage(aCanvas, 0, 0, 100, 100, 25, 25, AVATAR.radius * 2, AVATAR.radius * 2)
    ctx.restore()
    
    // XP bar
    ctx.loadingBar(150, 100, 330, 30, 30, remainder / expLim)
  
    // Ranking text
    ctx.font = 'bold 20pt Arial'
    ctx.textAlign = 'end'
    ctx.fillStyle = '#fff'
    ctx.fillText(`Rank #${userLevel ? userLevel.rank : 'Unknown'} - Level ${level}`, 470, 50)
  
    // Name and xp text
    ctx.textAlign = 'start'
    ctx.font = 'bold 14pt Arial'
    ctx.fillText(`${author.username}#${author.discriminator}`, 155, 92)
    ctx.textAlign = 'end'
    ctx.fillText(`${remainder}/${expLim}`, 470, 92)
  
    const buffer = canvas.toBuffer()
  
    channel.send({
      files: [{
        attachment: buffer,
        name: `rank-${author.id}.png`
      }]
    })

  }

  public static get help() {
    return help
  }

  public static get configs() {
    return configs
  }

}