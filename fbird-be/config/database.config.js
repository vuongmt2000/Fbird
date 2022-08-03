module.exports = {
  // url: 'mongodb+srv://vuvl:Vbn693178@cluster0.5ac7c.mongodb.net/ann_vote?retryWrites=true&w=majority'
  url: `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
};