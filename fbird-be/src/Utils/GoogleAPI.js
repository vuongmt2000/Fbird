const request = require('request-promise');
const googleConfig = require("../../config/google.config");

exports.getUserProfile = async (accessToken) => {
    try {
        const path = `userinfo?alt=json&access_token=${accessToken}`
        const res = await request({
            method: 'GET',
            uri: `${googleConfig.gg_api_url}/${path}`
        })
        return JSON.parse(res)
    } catch (error) {
        console.log(error);
    }
}