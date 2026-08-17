export default async (request, context) => {
  const validUser = Netlify.env.get("BASIC_AUTH_USER");
  const validPass = Netlify.env.get("BASIC_AUTH_PASS");
  return new Response("User attendu: " + validUser);
};

export const config = { path: "/*" };
