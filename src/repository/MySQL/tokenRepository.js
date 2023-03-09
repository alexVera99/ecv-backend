import { ITokenRepository } from "../../use_cases/interfaces/iTokenRepository.js";

export class TokenRepository extends ITokenRepository {
    constructor(connector) {
        super();
        this.table = "MOONSCAPE_3D_tokens";
        this.connector = connector;
    }
    async getToken(user_id) {
        let query = "SELECT token FROM " + this.table + " WHERE user_id = ?";
        let params = [user_id];

        let res = await this.connector.executeQueryWithParams(query, params);

        let token = res[0];
        return token;
    }
    async setToken(token, user_id) {
        let query = "INSERT INTO " + this.table + 
                    " (token, user_id) VALUES (?, ?)";
        let params = [token, user_id];

        await this.connector.executeQueryWithParams(query, params);
    }
    async deleteToken(token) {
        let query = "DELETE FROM " + this.table + " WHERE token = ?";
        let params = [token];

        return new Promise((resolve) => {
            this.connector.executeQueryWithParams(query, params)
            .then((res) => {
                let isTokenDeleted = res["affectedRows"] >= 1;
                let m;
                if(!isTokenDeleted) {
                    m = "Token " + token + " doesn't exist";
                }
                else {
                    m = "Token deleted: " + token;
                }
                let result = {
                    message: m,
                    success: isTokenDeleted
                }
                resolve(result)
            })
            .catch((err) => {
                let m = "Token " + token + 
                        " could not be deleted. Database error : " 
                        + err;
                
                let success = true;
                let result = {
                    message: m,
                    success: success
                }
                resolve(result);
            });
        })
    }
}
