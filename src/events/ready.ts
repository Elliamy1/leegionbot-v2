import { Client } from 'discord.js'
import { ActivityType, OAuth2Scopes, PermissionFlagsBits } from 'discord-api-types/v10'
import { DBClient } from '../db'
import { Countdown } from '../db/models'
import { logger, Blacklist, CountdownTimer, ModActions, TwitchManager } from '../utils'
import { VoteManager, ApplicationCommandManager, TicketManager } from '../managers'

export class Ready {

  public static async execute(client: Client) {
    logger.info(`Logged in as ${client.user?.tag}!`)

    client.managers = {
      applicationCommandManager: new ApplicationCommandManager(client),
      ticketManager: new TicketManager(),
    }
    client.managers.applicationCommandManager.registerGlobal()

    logger.info('Establising DB connection..')
    await DBClient.connect().then(() => {
      logger.info('Successfully connected to DB!')
    })

    logger.info('Initiating Countdown timer system..')
    new CountdownTimer(client)

    logger.info('Setting variables for individual guilds')
    await Promise.all(client.guilds.cache.map(async guild => {

      logger.info(`Now fetching for Guild ID ${guild.id}..`)

      // Word blacklist
      Blacklist.loadFromDB(guild.id)

      // Countdown Timers
      Countdown.fetchAllActive().then(({ items: countdowns }) => {
        countdowns.forEach(countdown => {
          CountdownTimer.add({ countdown })
        })
      })

    }))

    logger.info('Fetching active mutes..')
    ModActions.loadAllMutes(client)
    ModActions.monitorMutes()

    TwitchManager.getManager().fetchTrackers(client)
    new VoteManager(client)

    const url = client.generateInvite({
      scopes: [
        OAuth2Scopes.Bot,
        OAuth2Scopes.ApplicationsCommands,
        OAuth2Scopes.Connections,
      ],
      permissions: [
        PermissionFlagsBits.Administrator,
        PermissionFlagsBits.ManageGuild,
        PermissionFlagsBits.ManageRoles,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.KickMembers,
        PermissionFlagsBits.BanMembers,
        PermissionFlagsBits.ChangeNickname,
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.UseExternalEmojis,
        PermissionFlagsBits.AddReactions,
        PermissionFlagsBits.MuteMembers,
        PermissionFlagsBits.DeafenMembers,
        PermissionFlagsBits.MoveMembers,
      ]
    })

    client.user?.setActivity('/ticket to contact staff!', { type: ActivityType.Watching })

    logger.info(`Invite me at: ${url}`)

    logger.info('Now listening for events..');
  }

}