import "dotenv/config";

export default ({ config }) => {
  const extra = { ...config.extra };
  extra.auth0ClientId = process.env.AUTH0_CLIENT_ID;
  extra.auth0Domain = process.env.AUTH0_DOMAIN;
  config.extra = extra;
  return {
    ...config,
  };
};
