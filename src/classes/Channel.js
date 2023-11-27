import { ChannelType } from "../enum/ChannelType";
import Thread from "./Thread";

class Channel {
  constructor(json = {}) {
    const {
      flags,
      guild_id,
      id,
      name,
      parent_id,
      permission_overwrites,
      position,
      type,
      last_message_id,
      nsfw,
      rate_limit_per_user,
      topic,
      bitrate,
      rtc_region,
      user_limit,
      recipients,
      owner_id,
      icon,
      thread,
    } = json;
    this.flags = flags;
    this.guild_id = guild_id;
    this.id = id;
    this.name = name;
    this.parent_id = parent_id;
    this.permission_overwrites = permission_overwrites;
    this.position = position;
    this.type = type;
    this.last_message_id = last_message_id;
    this.nsfw = nsfw;
    this.rate_limit_per_user = rate_limit_per_user;
    this.topic = topic;
    this.bitrate = bitrate;
    this.rtc_region = rtc_region;
    this.user_limit = user_limit;
    this.recipients = recipients;
    this.owner_id = owner_id;
    this.icon = icon;
    this.thread = thread ? new Thread(thread) : null;
  }

  getGuildId() {
    return this.guild_id;
  }

  isDm() {
    return [ChannelType.DM, ChannelType.GROUP_DM].some(
      (type) => type === this.type
    );
  }

  isGuildForum() {
    return [ChannelType.GUILD_FORUM, ChannelType.GUILD_MEDIA].some(
      (type) => type === this.type
    );
  }

  isPublicThread() {
    return this.type === ChannelType.PUBLIC_THREAD;
  }

  isPrivateThread() {
    return this.type === ChannelType.PRIVATE_THREAD;
  }
}
export default Channel;