import { getUserById } from "../queries.js";

export async function getUserDetails(req, res) {
  try {
    const user = await getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { passwordHash, ...userDetails } = user;
    return res.json(userDetails);
  } catch (error) {
    console.error("Unable to fetch user:", error);
    return res.status(500).json({ error: "Unable to fetch user" });
  }
}

export default { getUserDetails };
