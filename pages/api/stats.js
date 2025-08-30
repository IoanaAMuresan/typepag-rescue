export default async function handler(req, res) {
  const stats = {
    totalDiscovered: 0,
    liveBlogs: 0,
    withContacts: 0,
    lastRun: null
  };
  
  res.status(200).json(stats);
}
