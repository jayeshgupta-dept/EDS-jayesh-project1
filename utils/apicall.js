// import Config from "../config/Config";
// import axios from "axios";
// import Global from "../screens/Global";
// import { isNetworkAvailable } from "../components/NetworkUtils";

const graphqlApiCall = (query, variables = {}, isMdm) => {
    console.log("GraphQL API Call", query, variables);

    const stringifiedVariables = JSON.stringify(variables);

    return new Promise(async (res, rej) => {
        try {
            if (isMdm && Global.cachedData[query]) {
                if (Global.cachedData[query][stringifiedVariables]) {
                    return res(Global.cachedData[query][stringifiedVariables]);
                }
            }
            let data = JSON.stringify({
                query: query,
                variables: variables,
                header: {
                    authToken: Global.authToken
                }
            });

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: Config.apiURL + '/graphql',  // Assuming your GraphQL endpoint is '/graphql'
                headers: {
                    'Content-Type': 'application/json',
                },
                data: data
            };

            axios.request(config)
                .then((response) => {
                    if (response.data.errors) {
                        // Handle GraphQL errors
                        rej({
                            status: 400,
                            msg: response.data.errors[0].message || "GraphQL Error",
                        });
                    } else if (response.data.data) {
                        const result = response.data.data;

                        if (isMdm) {
                            if (!Global.cachedData[query]) {
                                Global.cachedData[query] = {};
                            }
                            Global.cachedData[query][stringifiedVariables] = result;
                        }
                        res(result);
                    } else {
                        rej({
                            status: 'unknown',
                            msg: "Something went wrong, please try again",
                        });
                    }
                })
                .catch((error) => {
                    if (error.message === "Network Error") {
                        rej({
                            status: 'No internet',
                            msg: 'Internet connection is not available, Please connect to the Internet',
                        });
                    } else if (error.response && error.response.status === 401) {
                        Global.authExpired = true;
                        rej({
                            status: 401,
                            msg: "Your login session is expired, Please login again.",
                        });
                    } else {
                        try {
                            if (error.response.data.errors) {
                                rej({
                                    status: 400,
                                    msg: error.response.data.errors[0].message || "GraphQL Error",
                                });
                            } else {
                                rej({
                                    status: 'unknown',
                                    msg: "Something went wrong, please try again",
                                });
                            }
                        } catch (e) {
                            rej({
                                status: 'unknown',
                                msg: "Something went wrong, please try again",
                            });
                        }
                    }
                });
        } catch (error) {
            rej({
                status: "unknown",
                msg: "Something went wrong, please try again",
            });
        }
    });
}

export { graphqlApiCall };
