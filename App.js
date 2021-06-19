// Note this implementation only works in the browser

import React, { useEffect, useState } from "react";
import * as AuthSession from "expo-auth-session";
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

import { Auth0Provider } from "@auth0/auth0-react";
import { useAuth0 } from "@auth0/auth0-react";

const auth0ClientId = Constants.manifest.extra.auth0ClientId || "";
const auth0Domain = Constants.manifest.extra.auth0Domain || "";
const authorizationEndpoint = "https://" + auth0Domain + "/authorize";

const useProxy = Platform.select({ web: false, default: true });
const redirectUri = AuthSession.makeRedirectUri({ useProxy });

function AuthComponent() {
  const [name, setName] = React.useState(null);
  const [email, setEmail] = React.useState(null);
  const [text, onChangeText] = React.useState("Useless Text");
  const { isLoading, isAuthenticated, error, user, loginWithRedirect, logout } =
    useAuth0();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }
  if (error) {
    return <Text>Oops... {error.message}</Text>;
  }

  return (
    <>
      {user && user.name ? (
        <>
          <Text style={styles.title}>You are logged in, {user.name}!</Text>
          <Button
            title="Log out"
            onPress={() => logout({ returnTo: redirectUri })}
          />
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            onChangeText={onChangeText}
            value={text}
          />
          <Button
            title="Log in with Auth0"
            onPress={() => {
              console.log("clicked login");
              loginWithRedirect();
            }}
          />
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <Auth0Provider domain={auth0Domain} clientId={auth0ClientId} redirectUri>
      <View style={styles.container}>
        <AuthComponent />
      </View>
    </Auth0Provider>
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
