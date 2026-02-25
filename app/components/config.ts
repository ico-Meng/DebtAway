let API_ENDPOINT = "http://127.0.0.1:3000";

if (process.env.NODE_ENV !== "development") {
    API_ENDPOINT = "https://jb6jiia3k6.execute-api.us-east-1.amazonaws.com/prod";
}

export { API_ENDPOINT };