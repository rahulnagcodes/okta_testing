import React, { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import OktaSignInWidget from "./OktaSignInWidget";
import { useOktaAuth } from "@okta/okta-react";
const Login = ({ config }) => {
  console.log(config);
  const { oktaAuth, authState } = useOktaAuth();
  console.log(oktaAuth);
  console.log(authState);

  const [userInfo, setUserInfo] = useState(null);
  const [messages, setMessages] = useState(null);
  useEffect(() => {
    if (!authState || !authState.isAuthenticated) {
      // When user isn't authenticated, forget any user info
      setUserInfo(null);
    } else {
      oktaAuth
        .getUser()
        .then((info) => {
          console.log(info);
          setUserInfo(info);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [authState, oktaAuth]); // Update if authState changes
  useEffect(() => {
    if (authState.isAuthenticated) {
      const apiCall = async () => {
        try {
          const response = await fetch(
            "http://localhost:{serverPort}/api/messages",
            {
              headers: {
                Authorization: "Bearer " + authState.accessToken.accessToken,
              },
            }
          );
          const data = await response.json();
          console.log();
          setMessages(data.messages);
        } catch (err) {
          // handle error as needed
        }
      };
      apiCall();
    }
  }, [authState]);

  const onSuccess = (tokens) => {
    oktaAuth.handleLoginRedirect(tokens);
    // console.log(tokens);

    console.log(document.cookie);
    fetch("https://dev-93778550.okta.com/api/v1/sessions/me")
      .then((response) => response.json())
      .then((d) => console.log(d))
      .catch((e) => console.log(e));
  };

  const onError = (err) => {
    console.log("error logging in", err);
  };

  if (!authState) return null;

  return authState.isAuthenticated ? (
    <Redirect to={{ pathname: "/" }} />
  ) : (
    <OktaSignInWidget config={config} onSuccess={onSuccess} onError={onError} />
  );
};
export default Login;
