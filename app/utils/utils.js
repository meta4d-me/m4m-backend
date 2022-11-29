function parsePageParamToDBParam(page, gap) {
    if (+page < 1) {
        return [+gap, 0];
    }
    let offset = (+page - 1) * gap;
    return [+gap, offset];
}


module.exports = {
    parsePageParamToDBParam,
}
