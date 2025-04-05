const express = require("express");
const router = express.Router();
const usermodel = require("../models/user-model");
const readingModel = require("../models/reading-model");
const isLoggedin = require("../middlewares/isloggedin");
const axios = require("axios");
const { registeruser, loginuser, logout, deleteuser } = require("../controllers/usercontroller");

function convertStringToArray(ecgString) {
    if (!ecgString || typeof ecgString !== "string") return [];
    return ecgString.split(",").map(Number); // Convert CSV string to an array of numbers
}

router.get("/data", isLoggedin, async (req, res) => {
    try {
        if (!req.user) return res.status(401).send("Unauthorized");

        // Fetch data from ThingSpeak
        const response = await axios.get(
            "https://api.thingspeak.com/channels/2899536/feeds.json?api_key=XSKFNSIXIV79DAJ2&results=1"
        );

        const thingSpeakEntry = {
            timestamp: new Date(),
            data: response.data.feeds,
        };

        // Find user & update data
        const user = await usermodel.findById(req.user._id);
        if (!user) return res.status(404).send("User not found");

        user.thingSpeakData.push(thingSpeakEntry);
        await user.save();

        res.json(thingSpeakEntry);
    } catch (error) {
        console.error("Error fetching ThingSpeak data:", error);
        res.status(500).send("Error fetching data");
    }
});

router.get("/profile", isLoggedin, async (req, res) => {
    try {
        if (!req.user) return res.redirect("/");

        let userData = await usermodel.findById(req.user.id);
        if (!userData) return res.status(404).send("User not found");

        res.render("users/Profile", { 
            user: userData,  
            thingSpeakData: userData.thingSpeakData  
        });  
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).send("Server Error");
    }
});

router.get("/home", isLoggedin, async (req, res) => {
    try {
        if (!req.user) return res.redirect("/");

        let userData = await usermodel.findById(req.user._id).populate("readings");
        if (!userData) return res.status(404).send("User not found");

        let allReadings = [];

        // Check if user has any previous readings
        if (userData.readings.length > 0) {
            // Fetch latest health data from ThingSpeak
            const response = await axios.get(
                "https://api.thingspeak.com/channels/2899536/feeds.json?api_key=XSKFNSIXIV79DAJ2&results=1"
            );

            if (response.data.feeds.length) {
                const latestData = response.data.feeds[0];
                const ecgArray = convertStringToArray(latestData.field1);

                const lastReading = userData.readings[userData.readings.length - 1];

                let latestReading = {
                    id: "latest",
                    heartrate: latestData.field2,
                    spo2: latestData.field3,
                    temperature: latestData.field4,
                    ecg: ecgArray,
                    created_at: latestData.created_at
                };

                // Save to DB if data changed
                if (
                    !lastReading ||
                    lastReading.heartrate != latestData.field2 ||
                    lastReading.spo2 != latestData.field3 ||
                    lastReading.temperature != latestData.field4 ||
                    JSON.stringify(lastReading.ecg) !== JSON.stringify(ecgArray)
                ) {
                    console.log("New reading detected. Saving to database.");
                    const createReading = await readingModel.create({
                        userId: userData._id,
                        heartrate: latestData.field2,
                        spo2: latestData.field3,
                        ecg: ecgArray,
                        temperature: latestData.field4,
                        created_at: latestData.created_at,
                    });

                    userData.readings.push(createReading._id);
                    await userData.save();
                } else {
                    console.log("No new readings detected. Skipping save.");
                }

                // Refresh readings from DB after save
                const updatedUser = await usermodel.findById(req.user._id).populate("readings");
                allReadings = updatedUser.readings.map(reading => ({
                    id: reading._id,
                    heartrate: reading.heartrate,
                    spo2: reading.spo2,
                    temperature: reading.temperature,
                    ecg: reading.ecg,
                    created_at: reading.created_at
                }));

                // Add the latest fetched reading on top
                allReadings.unshift(latestReading);

                return res.render("users/home", { 
                    user: updatedUser, 
                    allReadings: JSON.stringify(allReadings) 
                });

            } else {
                console.warn("No data in ThingSpeak.");
            }
        }

        // For new users or users without readings
        res.render("users/home", { 
            user: userData, 
            allReadings: JSON.stringify([]) 
        });

    } catch (error) {
        console.error("Error fetching user home data:", error);
        res.status(500).send("Server Error");
    }
});


router.post("/registeruser", registeruser);
router.post("/loginuser", loginuser);
router.get("/logoutuser", logout);
router.get("/deleteuser", deleteuser);

module.exports = router;
