import "dotenv/config";

export default ({ config }) => {
  const extra = { ...config.extra };
  extra.auth0ClientId = process.env.AUTH0_CLIENT_ID;
  extra.auth0Domain = process.env.AUTH0_DOMAIN;
  extra.auth0ApiAudience = process.env.AUTH0_API_AUDIENCE;
  extra.auth0Realm = process.env.AUTH0_REALM;
  config.extra = extra;
  return {
    ...config,
  };
};
