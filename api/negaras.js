export default async function handler(req, res) {
  const response = await fetch("http://202.157.176.100:3001/negaras");
  const data = await response.json();
  res.status(200).json(data);
}
