import { Box, Stack, Typography, useTheme } from "@mui/material";
import AttachmentMock from "./attachment-mock";
import EmbedMock from "./embed-mock";
import { format, parseISO } from "date-fns";
import {
  formatUserData,
  getIconUrl,
  getColor,
  getTimeZone,
  getHighestRoles,
  getRoleNames,
} from "../utils";
import CheckIcon from "@mui/icons-material/Check";
import WebhookEmbedMock from "./webhook-embed-mock";
import { useGuildSlice } from "../features/guild/use-guild-slice";
import { useChannelSlice } from "../features/channel/use-channel-slice";
import { useThreadSlice } from "../features/thread/use-thread-slice";
import { useMessageSlice } from "../features/message/use-message-slice";
import { useExportSlice } from "../features/export/use-export-slice";
import Message from "../classes/message";
import Channel from "../classes/channel";
import AuthorAvatar from "./author-avatar";
import { getRichEmbeds } from "../utils";
import { MessageType } from "../enum/message-type";
import Role from "../classes/role";

type MessageMockProps = {
  message: Message;
  index: number | string;
  browserView?: boolean;
  isChained?: boolean;
};

const MessageMock = ({
  message,
  index,
  browserView = false,
  isChained = false,
}: MessageMockProps) => {
  const theme = useTheme();

  const { state: guildState } = useGuildSlice();
  const selectedGuild = guildState.selectedGuild();

  const { state: channelState } = useChannelSlice();
  const selectedChannel = channelState.selectedChannel();
  const channels = channelState.channels();

  const { state: threadState } = useThreadSlice();
  const threads = threadState.threads();

  const { state: messageState } = useMessageSlice();
  const messages = messageState.messages();

  const { state: exportState, getFormattedInnerHtml } = useExportSlice();
  const userMap = exportState.userMap();
  const roleMap = exportState.roleMap();

  const messageDate = parseISO(message.timestamp);
  const tz = getTimeZone(messageDate);
  const shortDateTime = `${format(messageDate, "MM/dd/yyyy")} at ${format(
    messageDate,
    "HH:mm:ss"
  )} ${tz}`;
  const longDateTime = `${format(
    messageDate,
    "EEEE, LLLL d, yyyy HH:mm:ss"
  )} ${tz}`;

  const foundThread = threads?.find(
    (thread) => thread.id === message.id || thread.id === message.channel_id
  );
  const repliedToMsg =
    message.type === MessageType.REPLY
      ? messages.find((msg) => msg.id === message.message_reference?.message_id)
      : null;

  const showChannelName = selectedGuild?.id && !selectedChannel?.id;

  const getAuthorName = (msg: Message) => {
    const author = msg.author;

    const {
      roles: guildRoles,
      nick: guildNickname,
      joinedAt,
    } = userMap[author.id]?.guilds[String(selectedGuild?.id)] || {};

    let roleNames: string[] = [];
    let colorRole: Role | Maybe = null;
    let iconRole: Role | Maybe = null;

    if (selectedGuild) {
      const highestRole = getHighestRoles(guildRoles, selectedGuild);
      if (highestRole) {
        colorRole = highestRole.colorRole;
        iconRole = highestRole.iconRole;
      }
      roleNames = getRoleNames(guildRoles, selectedGuild);
    }

    return (
      <>
        <strong
          title={formatUserData({
            userId: author.id,
            userName: author.username,
            displayName: author.global_name,
            guildNickname,
            joinedAt,
            roleNames,
          })}
          style={{ color: colorRole ? getColor(colorRole.color) : undefined }}
        >
          {guildNickname || author.global_name || author.username}
        </strong>
        {iconRole && (
          <img
            title={iconRole.name}
            style={{ width: "20px", height: "20px" }}
            src={
              roleMap[String(getIconUrl(iconRole))] ||
              getIconUrl(iconRole) ||
              undefined
            }
            alt="role-icon"
          />
        )}
        {!iconRole && msg.author.bot && (
          <span
            title="Verified Bot"
            style={{
              color: "#FFF !important",
              backgroundColor: "#5865f2",
              borderRadius: "5px",
              display: "inline-flex",
              fontSize: "10px",
              alignItems: "center",
              justifyContent: "center",
              height: "16px",
              width: "38px",
              gap: "2px",
              wordBreak: "keep-all",
            }}
          >
            <CheckIcon sx={{ width: "12px !important" }} /> BOT
          </span>
        )}
      </>
    );
  };

  const getMessageContent = (
    content: string,
    id: string,
    isReply: boolean = false
  ) => {
    const rawHtml = getFormattedInnerHtml({
      content,
      isReply,
      exportView: !browserView,
    });
    return (
      <Typography
        id={id}
        variant={isReply ? "caption" : "body1"}
        sx={{
          display: "block",
          color: isReply
            ? theme.palette.text.disabled
            : theme.palette.text.secondary,
          whiteSpace: isReply ? "nowrap" : "pre-line",
          overflow: isReply ? "hidden" : undefined,
          wordBreak: "break-word",
        }}
        dangerouslySetInnerHTML={{ __html: rawHtml }}
      />
    );
  };

  const getRepliedToContent = (replyMessage: Message) => {
    return (
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="flex-start"
        spacing={1}
      >
        <div
          style={{
            marginLeft: 20,
            marginTop: 8,
            height: 7,
            width: 17,
            borderLeft: "2px solid #4e5058",
            borderTop: "2px solid #4e5058",
            borderTopLeftRadius: "5px",
          }}
        />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-start"
          spacing={1}
          sx={{ maxWidth: 600 }}
        >
          <AuthorAvatar
            browserView={browserView}
            message={replyMessage}
            isReply
          />
          <Typography
            sx={{
              display: "flex",
              gap: "5px",
              "& a": {
                display: "flex",
                gap: "5px",
                color: "inherit",
                textDecoration: "inherit",
              },
              "& span": {
                color: "#FFF !important",
              },
              color: "#a0a1a4",
              whiteSpace: "nowrap",
            }}
            variant="caption"
          >
            {browserView ? (
              getAuthorName(replyMessage)
            ) : (
              <a href={`#${replyMessage.id}`}>{getAuthorName(replyMessage)}</a>
            )}
          </Typography>
          {getMessageContent(replyMessage.content, `reply-data-${index}`, true)}
        </Stack>
      </Stack>
    );
  };

  const getChannelName = () => {
    return (
      <Typography
        variant="caption"
        mt="1px"
        sx={{
          textDecoration: "underline",
          textDecorationStyle: "dotted",
          color: theme.palette.text.primary,
        }}
      >
        {channels.find((channel) => channel.id === message.channel_id)?.name}
      </Typography>
    );
  };

  const getThread = (thread: Channel) => {
    return (
      <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
        {thread.name}
      </Typography>
    );
  };

  const getAttachments = () => {
    return (
      <Stack
        mt="5px"
        direction="column"
        justifyContent="flex-start"
        alignItems="flex-start"
        spacing={1}
      >
        {message.attachments.map((attachment) => (
          <AttachmentMock attachment={attachment} />
        ))}
        {message.embeds.map((embed, index) => (
          <EmbedMock embed={embed} index={index} />
        ))}
      </Stack>
    );
  };

  const getEmbeds = () => {
    return (
      <Stack
        sx={{ maxWidth: "600px" }}
        mt="5px"
        direction="column"
        justifyContent="flex-start"
        alignItems="flex-start"
        spacing={1}
      >
        {getRichEmbeds(message).map((embed) => (
          <WebhookEmbedMock alwaysExpanded={true} embed={embed} />
        ))}
      </Stack>
    );
  };

  const getChainedDate = () => {
    const shortTime = format(messageDate, "HH:mm:ss");

    return (
      <Box
        title={longDateTime}
        sx={{
          width: "fit-content",
          height: "20px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Typography
          id={`chained-message-${message.id}`}
          sx={{
            fontSize: "10px !important",
            color: theme.palette.text.disabled,
            opacity: 0,
          }}
          variant="caption"
        >
          {shortTime}
        </Typography>
      </Box>
    );
  };

  return (
    <Stack
      direction="column"
      alignItems="flex-start"
      justifyContent="flex-start"
      id={message.id}
      sx={{
        width: "calc(100% - 10px)",
        "&:hover": {
          backgroundColor: !browserView ? "#2e2f35" : undefined,
          "& span": { opacity: "1 !important" },
        },
        margin: isChained ? "0px 0px 0px !important" : undefined,
        "&:target": {
          background: "rgb(92, 107, 192, 0.25)",
          padding: "5px",
          width: "calc(100% - 10px)",
        },
      }}
    >
      {repliedToMsg && getRepliedToContent(repliedToMsg)}
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="flex-start"
        spacing={1}
        sx={{
          paddingLeft: !browserView ? "8px" : undefined,
          maxWidth: "100vw",
          wordBreak: "break-all",
          minHeight: isChained ? 0 : "50px",
        }}
      >
        {!isChained && (
          <AuthorAvatar browserView={browserView} message={message} />
        )}
        {isChained && getChainedDate()}
        <Stack
          direction="column"
          alignItems="flex-start"
          justifyContent="flex-start"
        >
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={1}
          >
            <Typography
              sx={{
                display: "flex",
                gap: "5px",
                "& a": {
                  display: "flex",
                  gap: "5px",
                },
                color: theme.palette.text.primary,
              }}
              variant="body2"
            >
              {!isChained && getAuthorName(message)}
            </Typography>
            {!isChained && (
              <>
                <Typography
                  title={longDateTime}
                  mt="1px"
                  sx={{ color: theme.palette.text.disabled }}
                  variant="caption"
                >
                  {shortDateTime}
                </Typography>
                {showChannelName && getChannelName()}
              </>
            )}
          </Stack>
          {!isChained && foundThread && getThread(foundThread)}
          {getMessageContent(message.content, `message-data-${index}`)}
          {!browserView && getAttachments()}
          {!browserView && getEmbeds()}
        </Stack>
      </Stack>
    </Stack>
  );
};
export default MessageMock;