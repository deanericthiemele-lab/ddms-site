export default async (request, context) => {
  return new Response("Test OK");
};

export const config = { path: "/*" };
