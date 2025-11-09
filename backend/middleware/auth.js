import jwt from "jsonwebtoken";

// send to login
router.post("/login", async (req, res) => {
  // give username and password
  const { username, password } = req.body;

  // check if inputted
  if (!username || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  // check username given by input same as in db
  const user = userByUsername(username);
  if (!user)
    return res.status(401).json({ message: "Invalid username or password" });

  // check password given against password for that info
  const matching = await verifyPassword(password, user.password);
  if (!matching)
    return res.status(401).json({ message: "Invalid username or password" });

  // Create JWT token
  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  res.status(200).json({ message: "Login success", token });
});
