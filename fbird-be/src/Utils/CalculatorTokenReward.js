const BASE_REWAED = 100
const BASE_COEFFICIENT = [1, 1.3, 1.7, 2, 2.5, 3.25, 4, 5.25, 6, 7, 8.25, 10]

const calculatorTokenReward = (point, star) => {
    return BASE_REWAED * BASE_COEFFICIENT[star - 1] * (point / (point + 1)) ** 2
}

module.exports = {
    BASE_REWAED,
    BASE_COEFFICIENT,
    calculatorTokenReward
}