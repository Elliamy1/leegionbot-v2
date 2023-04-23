import { Sync } from './admin'
import { Ping, Levels, User, Rank } from './informational'
import { Close, Log, Reply, Setup, Ticket } from './ticket'

export default [
  Close,
  Log,
  Reply,
  Setup,
  Ticket,

  Sync,

  Rank,
  Levels,
  Ping,
  User,
]