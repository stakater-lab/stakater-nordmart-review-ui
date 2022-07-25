import React from "react";
import {AppBar, Box, Container, Toolbar, Typography} from "@material-ui/core";
import StakaterLogo from "../../assets/img/stakater-icon.svg";
import {AppNotification} from "../notifications/notification";
declare var VERSION: string;

export const TopMenu = () => {
  return (
    <AppBar>
      <AppNotification/>
      <Container>
        <Toolbar>
          <Box display="flex" marginRight="auto">
            <StakaterLogo height={24}/>
            <Typography variant={"h5"}>Stakater</Typography>
            <Typography variant={"caption"}>Reviews {VERSION}</Typography>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
