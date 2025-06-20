export default async function handler(req, res) {
  const { filter } = req.query;
  const url = `http://202.157.176.100:3001/barangs?${
    filter ? `filter=${encodeURIComponent(filter)}` : ""
  }`;
  const response = await fetch(url);
  const data = await response.json();
  res.status(200).json(data);
}
