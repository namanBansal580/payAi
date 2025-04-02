import axios from "axios";
export async function POST(req,res) {
    try {
        const response = await axios.post(
            "https://api.twitter.com/2/oauth2/token",
            new URLSearchParams({
                client_id: "cVRqVVBJQUxpN2RTTFczcFZGV0s6MTpjaQ",
                client_secret: "7JAc771bBIKpDZ-bj2vT8D75fBKj1vRGmPHRomIVwfQTD6E18c",
                redirect_uri: "http://localhost:3000/api/verify-twitter",
                grant_type: "authorization_code",
                code,
                code_verifier: "challenge",
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const accessToken = response.data.access_token;
        console.log("OAuth Token:", accessToken); // ✅ Print OAuth Token in Console

        return Response.json({ oauth_token: accessToken });
    } catch (error) {
        console.error("Error exchanging code:", error.response?.data || error.message);
        return Response.json({ error: "Authentication failed" });
    }
}