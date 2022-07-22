import { GuildMember } from 'discord.js'
import { ButtonHandler, HandlerProps } from './handler'
import { IActionType, IRoleAction } from '../managers'
import { logger, formatDiff } from '../utils'

export class Rolemenu extends ButtonHandler {

  public static async execute({
    client,
    interaction,
    args,
  }: HandlerProps) {

    if (!interaction.isButton()) return

    const { guild, member } = interaction

    const id = args.shift()

    if (!id || !guild || !member) return interaction.editReply('Unable to edit role at this time.').catch(e => {
      logger.debug(e.message)
      logger.debug('Catch 1')
    })

    const role = guild.roles.cache.get(id) || await guild.roles.fetch(id)

    if (!role) return interaction.editReply('Unable to edit role at this time.').catch(e => {
      logger.debug(e.message)
      logger.debug('Catch 2')
    })

    const count = client.roleManager.getQueueCount(guild.id)
    const message = count > 290 ? `A lot of members are currently requesting roles. I will edit your role in roughly ${formatDiff((Math.ceil(count / 10) * 10) * 1000)}.${count > 900 ? `If this takes more than 15 minutes, this interaction might fail but I should still edit your role after the estimated time!` : `I'll ping you when I have edited yours! Sit tight!`}` : `Editing your role. This may take a moment, please wait!`

    if (count >= 10) {
      await interaction.editReply(message).catch(e => {
        logger.debug(e.message)
        logger.debug('Catch 3')
      })
    }

    await (member as GuildMember).fetch()

    const add = !((member as GuildMember).roles.cache.some(r => r.name.toLowerCase() === role.name))

    const early = interaction.editReply(`Role ${role} was ${add ? 'assigned to' : 'removed from'} you!`)
    .catch(e => {
      logger.debug(e.message)
      logger.debug('Catch 4')
    })

    const late = interaction.followUp({
      ephemeral: true,
      content: `Hey ${member}! Role ${role} was ${add ? 'assigned to' : 'removed from'} you!`
    })
    .catch(e => {
      logger.debug(e.message)
      logger.debug('Catch 5')
    })

    client.roleManager.add((member as GuildMember), role, add ? IRoleAction.ADD : IRoleAction.REMOVE, IActionType.MENU, () => count < 10 ? early : late)

  }

}