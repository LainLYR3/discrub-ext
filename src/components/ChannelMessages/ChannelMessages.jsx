import React, { useState, useEffect } from "react";
import {
  fetchGuilds,
  fetchChannels,
  fetchMessageData,
} from "../../discordService";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import DiscordTextField from "../DiscordComponents/DiscordTextField/DiscordTextField";
import DiscordTypography from "../DiscordComponents/DiscordTypography/DiscordTypography";
import DiscordSpinner from "../DiscordComponents/DiscordSpinner/DiscordSpinner";
import DiscordTable from "../DiscordComponents/DiscordTable/DiscordTable";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import DiscordPaper from "../DiscordComponents/DiscordPaper/DiscordPaper";

function ChannelMessages({ userData }) {
  const [guilds, setGuilds] = useState(null);
  const [channels, setChannels] = useState(null);

  const [selectedGuild, setSelectedGuild] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);
  const [messageData, setMessageData] = useState(null);

  const boxSx = {
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    marginTop: "1vh",
  };

  useEffect(() => {
    const getMessages = async () => {
      try {
        setFetchingData(true);
        let lastId = "";
        let reachedEnd = false;
        let retArr = [];
        while (!reachedEnd) {
          const data = await fetchMessageData(
            userData.token,
            lastId,
            selectedChannel
          );
          if (data.length < 100) {
            reachedEnd = true;
          }
          if (data.length > 0) {
            lastId = data[data.length - 1].id;
          }
          if (data && (data[0]?.content || data[0]?.attachments))
            retArr = retArr.concat(data);
        }
        setMessageData(retArr);
        setFetchingData(false);
      } catch (e) {
        console.error("Error fetching channel messages");
      } finally {
        setFetchingData(false);
      }
    };
    setMessageData(null);
    if (selectedChannel) getMessages();
  }, [selectedChannel]);

  useEffect(() => {
    const getChannels = async () => {
      try {
        setFetchingData(true);
        let data = await fetchChannels(userData.token, selectedGuild);
        if (Array.isArray(data)) setChannels(data);
      } catch (e) {
        console.error("Error fetching channels");
      } finally {
        setFetchingData(false);
      }
    };
    setSelectedChannel(null);
    setMessageData(null);
    if (selectedGuild) getChannels();
  }, [selectedGuild]);

  useEffect(() => {
    const getGuilds = async () => {
      try {
        setMessageData(null);
        setFetchingData(true);
        let data = await fetchGuilds(userData.token);
        if (Array.isArray(data)) setGuilds(data);
      } catch (e) {
        console.error("Error fetching guilds.");
      } finally {
        setFetchingData(false);
      }
    };
    if (userData && userData.token) getGuilds();
  }, []);

  return (
    <Box
      sx={{
        padding: "15px",
        maxHeight: "85%",
        maxWidth: "100%",
        overflow: "auto",
      }}
    >
      {userData && guilds && (
        <>
          <DiscordPaper>
            <DiscordTypography variant="h5">
              Your Channel Messages
            </DiscordTypography>
            <DiscordTypography variant="caption">
              Messages between other Discord users and yourself, within Guilds.
            </DiscordTypography>
            <DiscordTextField
              disabled={fetchingData}
              value={selectedGuild}
              onChange={(e) => setSelectedGuild(e.target.value)}
              sx={{ my: "5px" }}
              select
              label="Guilds"
            >
              {guilds.map((guild) => {
                return (
                  <MenuItem key={guild.id} value={guild.id}>
                    {guild.name}
                  </MenuItem>
                );
              })}
            </DiscordTextField>
            <DiscordTextField
              disabled={selectedGuild === null || fetchingData}
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              sx={{ my: "5px" }}
              select
              label="Channels"
            >
              {channels &&
                channels.map((channel) => {
                  return (
                    <MenuItem key={channel.id} value={channel.id}>
                      {channel.name}
                    </MenuItem>
                  );
                })}
            </DiscordTextField>
          </DiscordPaper>
          {messageData && messageData.length > 0 && !fetchingData && (
            <ChannelMsgTable rows={messageData} userData={userData} />
          )}
          {messageData && messageData.length === 0 && !fetchingData && (
            <DiscordPaper>
              <Box container sx={boxSx}>
                <DiscordTypography>No Messages to Display</DiscordTypography>
              </Box>
              <Box container sx={boxSx}>
                <DiscordTypography>
                  <SentimentDissatisfiedIcon />
                </DiscordTypography>
              </Box>
            </DiscordPaper>
          )}
        </>
      )}
      {(!userData || !guilds || fetchingData) && (
        <DiscordPaper>
          <DiscordSpinner />
        </DiscordPaper>
      )}
    </Box>
  );
}

const ChannelMsgTable = ({ rows, userData }) => {
  const [refactoredData, setRefactoredData] = useState(null);

  useEffect(() => {
    const refactorData = async () => {
      let retArr = [];
      await rows.forEach((x) =>
        retArr.push({
          username: x.author.username,
          ...x,
        })
      );
      setRefactoredData(retArr);
    };
    refactorData();
  }, []);

  return (
    <>
      {refactoredData && (
        <DiscordTable
          rows={refactoredData}
          userData={userData}
          setRefactoredData={setRefactoredData}
        />
      )}
    </>
  );
};

export default ChannelMessages;
