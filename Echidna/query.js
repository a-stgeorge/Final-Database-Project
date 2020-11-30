async function makeQuery(connection, queryString) {
    try {
        if (!queryString) {
            throw new Error('Invalid query (empty string passed)');
        }
        //TODO can do error checks here and throw appropriate errors
        let answer = await connection.query(queryString);
        return answer;
    } catch (err) {
        throw err;
    }
};

module.exports = makeQuery;