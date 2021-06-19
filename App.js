import React from "react";
import "@expo/browser-polyfill";
import auth0 from "auth0-js";
import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
import jwtDecode from "jwt-decode";
import {
  Button,
  Platform,
  StyleSheet,
  Text,
  ScrollView,
  TextInput,
} from "react-native";

const auth0ClientId = Constants.manifest.extra.auth0ClientId || "";
const auth0Domain = Constants.manifest.extra.auth0Domain || "";
const auth0ApiAudience = Constants.manifest.extra.auth0ApiAudience || "";
const auth0Realm = Constants.manifest.extra.auth0Realm || "";

const useProxy = Platform.select({ web: false, default: true });
const redirectUri = AuthSession.makeRedirectUri({ useProxy });

const webAuth = new auth0.WebAuth({
  domain: auth0Domain,
  clientID: auth0ClientId,
  audience: auth0ApiAudience,
  redirectUri,
  scope: "openid profile email read:current_user update:current_user_metadata",
  responseType: "token id_token",
});

const logout = (clearAppStateFn) => {
  webAuth.logout({
    clientID: auth0ClientId,
    returnTo: redirectUri,
  });
  clearAppStateFn();
};

const login = (username, pass, setAppStateFn) => {
  webAuth.client.login(
    {
      realm: auth0Realm,
      username,
      password: pass,
    },
    (err, authResult) => {
      if (err) {
        alert("Error", err.description);
        return;
      }
      if (authResult) {
        console.log(authResult);
        const jwtToken = authResult.idToken;
        const decoded = jwtDecode(jwtToken);
        setAppStateFn(decoded.name);
        //window.origin = window.location.origin;
      }
    }
  );
};

export default function App() {
  const [email, onEmailChange] = React.useState("");
  const [password, onPasswordChange] = React.useState("");
  const [name, setName] = React.useState(null);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.wrapper}>
      {name ? (
        <>
          <Text style={styles.title}>You are logged in, {name}!</Text>
          <Button title="Log out" onPress={() => logout(() => setName(null))} />
        </>
      ) : (
        <>
          <Text>Enter email and password</Text>
          <TextInput
            style={styles.input}
            onChangeText={onEmailChange}
            value={email}
            placeholder="<email>"
            autoCompleteType="email"
            autoFocus={true}
            autoCorrect={false}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            onChangeText={onPasswordChange}
            value={password}
            placeholder="<password>"
            autoCompleteType="password"
            secureTextEntry={true}
            autoCorrect={false}
          />
          <Button
            title="Login"
            onPress={() => {
              login(email, password, setName);
            }}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", justifyContent: "center" },

  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 200,
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
    minWidth: 200,
  },
});
