// Note this implementation only works in the browser

import React, { useEffect, useState } from "react";
import auth0 from "auth0-js";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import {
  Alert,
  Button,
  Platform,
  StyleSheet,
  Text,
  View,
  TextInput,
} from "react-native";
import Constants from "expo-constants";

WebBrowser.maybeCompleteAuthSession();

const auth0ClientId = Constants.manifest.extra.auth0ClientId || "";
const auth0Domain = Constants.manifest.extra.auth0Domain || "";
const authorizationEndpoint = "https://" + auth0Domain + "/authorize";

const useProxy = Platform.select({ web: false, default: true });
const redirectUri = AuthSession.makeRedirectUri({ useProxy });

const webAuth = new auth0.WebAuth({
  domain: auth0Domain,
  clientID: auth0ClientId,
  scope: "openid profile email",
  responseType: "token id_token",
  redirectUri,
});

export default function App() {
  const [name, setName] = React.useState(null);
  const [email, setEmail] = React.useState(null);
  const [text, onChangeText] = React.useState("Useless Text");

  webAuth.parseHash({ hash: window.location.hash }, function (err, authResult) {
    if (err) {
      return console.log(err);
    }

    webAuth.client.userInfo(authResult.accessToken, function (err, user) {
      // Now you have the user's information
      if (err) {
        return console.log(err);
      }
      if (user && user.name) {
        setName(user.name);
      }
    });
  });

  function onPasswordlessStart(enteredEmail) {
    webAuth.passwordlessStart(
      {
        connection: "email",
        send: "code",
        email: enteredEmail,
      },
      function (err, res) {
        if (err) {
          console.error(err);
        } else {
          console.log(res);
          setEmail(enteredEmail);
          onChangeText("");
        }
        // handle errors or continue
      }
    );
  }

  function onPasswordlessVerify(enteredOTP) {
    webAuth.passwordlessLogin(
      {
        connection: "email",
        verificationCode: enteredOTP,
        email,
      },
      function (err, res) {
        if (err) {
          console.error(err);
        } else {
          console.log(res);
          webAuth.parseHash(
            { hash: window.location.hash },
            function (err, authResult) {
              if (err) {
                return console.log(err);
              }

              webAuth.client.userInfo(
                authResult.accessToken,
                function (err, user) {
                  if (err) {
                    return console.log(err);
                  }
                  // Now you have the user's information
                  if (user && user.name) {
                    setName(user.name);
                  }
                }
              );
            }
          );
        }
        // handle errors or continue
      }
    );
  }

  return (
    <View style={styles.container}>
      {name ? (
        <>
          <Text style={styles.title}>You are logged in, {name}!</Text>
          <Button title="Log out" onPress={() => setName(null)} />
        </>
      ) : email ? (
        <>
          <Text>You entered this! {email}</Text>
          <Text>Please type OTP:</Text>
          <TextInput
            style={styles.input}
            onChangeText={onChangeText}
            value={text}
          />
          <Button title="Verify" onPress={() => onPasswordlessVerify(text)} />
        </>
      ) : (
        <>
          <Text style={styles.title}>Enter your email: </Text>
          <TextInput
            style={styles.input}
            onChangeText={onChangeText}
            value={text}
          />
          <Button
            title="Email me OTP"
            onPress={() => onPasswordlessStart(text)}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    marginTop: 40,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
  },
});
