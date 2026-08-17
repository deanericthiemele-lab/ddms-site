export default async (request, context) => {
  const auth = request.headers.get("authorization");
  const validUser = Netlify.env.get("BASIC_AUTH_USER");
  const validPass = Netlify.env.get("BASIC_AUTH_PASS");

  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const sep = decoded.indexOf(":");
      const user = decoded.slice(0, sep);
      const pass = decoded.slice(sep + 1);
      if (user === validUser && pass === validPass) {
        return context.next();
      }
    }
  }

  return new Response("Authentification requise.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="DDMS Portal"',
    },
  });
};

export const config = { path: "/*" };
