import jwt from "jsonwebtoken";

// const tokenGeneration = (userId) => {
//     const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
//     return token;
// }

// export default tokenGeneration;

const tokenGeneration = (user) => {
  const token = jwt.sign(
    { id: user._id, role: user.role }, // 👈 include role
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  return token;
};

export default tokenGeneration;
