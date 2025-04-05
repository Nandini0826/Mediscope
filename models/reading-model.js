const mongoose = require("mongoose");

const readingSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,  
        ref: "user"
    },
    heartrate: { type: String, default: "N/A" },  // Heart rate from ThingSpeak
    spo2: { type: String, default: "N/A" },       // Oxygen level from ThingSpeak
    ecg: { type: Array, default: [] },        // ECG from ThingSpeak
    temperature: { type: String, default: "N/A" }, // Temperature from ThingSpeak
    created_at: { type: Date, default: Date.now },
    thingSpeakData: [
        {
            timestamp: { type: Date, default: Date.now },
            data: Object
        }
    ]
});

module.exports = mongoose.model("reading", readingSchema);
