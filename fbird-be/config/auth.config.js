module.exports = {
  secret: "Ftech-ai",
  refreshTokenSecret: "Ftech-ai-refresh-token",
  tokenLife: 86400 * 50, // 1 ngày
  refreshTokenLife: 86400 * 5, // 5 ngày
  salt: 8,
  activeCodelLife: 1000 * 60 * 10, // 10 phút,
  isActiveByMail: true,
  emailService: "gmail",
  emailHost: "smtp.gmail.com",
  emailUser: "va.crm.ftech@gmail.com",
  emailPass: "cevtjyksxtnkcyqh"
};
