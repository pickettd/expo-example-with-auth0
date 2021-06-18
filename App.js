import React, { useEffect, useState } from "react";
import { AsyncStorage, Button, StyleSheet, Text, View } from "react-native";
import * as AppAuth from "expo-app-auth";
import Constants from "expo-constants";
import jwtDecode from "jwt-decode";

const auth0ClientId = Constants.manifest.extra.auth0ClientId || "";
const auth0Domain = Constants.manifest.extra.auth0Domain || "";
const authorizationEndpoint = "https://" + auth0Domain + "/authorize";

export default function App() {
  let [authState, setAuthState] = useState(null);
  const [name, setName] = React.useState(null);

  useEffect(() => {
    (async () => {
      let cachedAuth = await getCachedAuthAsync();
      if (cachedAuth && !authState) {
        setAuthState(cachedAuth);
        const jwtToken = cachedAuth.idToken;
        const decoded = jwtDecode(jwtToken);

        const { name } = decoded;
        setName(name);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      {name !== null ? (
        <></>
      ) : (
        <Button
          title="Sign In with any OAuth"
          onPress={async () => {
            const _authState = await signInAsync();
            setAuthState(_authState);
            const jwtToken = _authState.idToken;
            const decoded = jwtDecode(jwtToken);

            const { name } = decoded;
            setName(name);
          }}
        />
      )}
      {name === null ? (
        <></>
      ) : (
        <>
          <Text>Hello {name}</Text>
          <Button
            title="Sign Out "
            onPress={async () => {
              const _authState = { ...authState };
              await signOutAsync(_authState);
              setAuthState(null);
              setName(null);
            }}
          />
        </>
      )}
      {/*<Text>{JSON.stringify(authState, null, 2)}</Text>*/}
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
});

let config = {
  issuer: authorizationEndpoint,
  scopes: ["openid", "profile"],
  /* This is the CLIENT_ID generated from a Firebase project */
  clientId: auth0ClientId,
};

let StorageKey = "@MyApp:CustomOAuthKey";

export async function signInAsync() {
  let authState = await AppAuth.authAsync(config);
  await cacheAuthAsync(authState);
  console.log("signInAsync", authState);
  return authState;
}

async function cacheAuthAsync(authState) {
  return await AsyncStorage.setItem(StorageKey, JSON.stringify(authState));
}

export async function getCachedAuthAsync() {
  let value = await AsyncStorage.getItem(StorageKey);
  let authState = JSON.parse(value);
  console.log("getCachedAuthAsync", authState);
  if (authState) {
    if (checkIfTokenExpired(authState)) {
      return refreshAuthAsync(authState);
    } else {
      return authState;
    }
  }
  return null;
}

function checkIfTokenExpired({ accessTokenExpirationDate }) {
  return new Date(accessTokenExpirationDate) < new Date();
}

async function refreshAuthAsync({ refreshToken }) {
  let authState = await AppAuth.refreshAsync(config, refreshToken);
  console.log("refreshAuth", authState);
  await cacheAuthAsync(authState);
  return authState;
}

export async function signOutAsync({ accessToken }) {
  try {
    await AppAuth.revokeAsync(config, {
      token: accessToken,
      isClientIdProvided: true,
    });
    await AsyncStorage.removeItem(StorageKey);
    return null;
  } catch (e) {
    alert(`Failed to revoke token: ${e.message}`);
  }
}
