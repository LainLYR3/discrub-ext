import Attachment from "../../classes/attachment";
import Channel from "../../classes/channel";
import Embed from "../../classes/embed";
import { Emoji } from "../../classes/emoji";
import Guild from "../../classes/guild";
import Message from "../../classes/message";
import { Reaction } from "../../classes/reaction";
import Role from "../../classes/role";
import { User } from "../../classes/user";
import { DiscrubSetting } from "../../enum/discrub-setting";

export type AppState = {
  discrubPaused: boolean;
  discrubCancelled: boolean;
  task: AppTask;
  settings: AppSettings;
};

export type AppTask = {
  active: boolean;
  entity:
    | (Message & { _index?: number; _total?: number })
    | Channel
    | User
    | Guild
    | Reaction
    | Emoji
    | Role
    | Attachment
    | Embed
    | Maybe;
  statusText: string | Maybe;
};

export type Timeout = {
  message: string;
  timeout: number;
};

export type AppSettings = Record<DiscrubSetting, string>;
