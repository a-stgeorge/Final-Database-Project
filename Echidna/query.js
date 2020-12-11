async function makeQuery(connection, queryString) {
    try {
        if (!queryString) {
            throw new Error('Invalid query (empty string passed)');
        }
        let answer = await connection.query(queryString);
        return answer;
    } catch (err) {
        throw err;
    }
};

module.exports = makeQuery;