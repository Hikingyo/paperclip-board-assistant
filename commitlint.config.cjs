module.exports = {
  extends: ["@commitlint/config-conventional"],
  ignores: [(message) => message.startsWith("Initial commit")],
  rules: {
    "subject-case": [0],
  },
};
