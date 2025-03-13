import React, { useState, useEffect } from 'react';
import { profiles } from './profiles';
import OpenAI from 'openai';

function App() {
    const [firstProfile, setFirstProfile] = useState(null);
    const [secondProfile, setSecondProfile] = useState(null);
    const [showConvo, setShowConvo] = useState(false);
    const [messages, setMessages] = useState([]);
    const [showSimulateButton, setShowSimulateButton] = useState(false);

    const [compatibilityReport, setCompatibilityReport] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleRestart = () => {
        setShowConvo(false);
        setFirstProfile(null);
        setSecondProfile(null);
        setMessages([]);
        setShowSimulateButton(false);
    };

    const handleFirstSpin = () => {
        const randomProfile = profiles[Math.floor(Math.random() * profiles.length)];
        setFirstProfile(randomProfile);
        setSecondProfile(null);
        setShowConvo(false);
        setShowSimulateButton(false);
    };

    const handleSecondSpin = () => {
        if (firstProfile) {
            console.log("got here");
            console.log(firstProfile.matches)
            const matches = (firstProfile.matches);
            const randomMatchId = matches[Math.floor(Math.random() * matches.length)];
            const matchProfile = profiles.find(profile => profile.ID === randomMatchId);
            setSecondProfile(matchProfile);
            setShowSimulateButton(true);
        }
    };

    const client = new OpenAI({
        // baseURL: "https://api.targon.com/v1",
        // apiKey: process.env.REACT_APP_TARGON_KEY,
        // dangerouslyAllowBrowser: true


        base_url: "https://openrouter.ai/api/v1",
        apiKey: process.env.REACT_APP_OPENROUTER,
        dangerouslyAllowBrowser: true
    });


    const generateCompatibilityReport = async () => {
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + process.env.REACT_APP_OPENROUTER,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "google/gemma-3-27b-it:free",
                    "messages": [
                        {
                            role: "system",
                            content: `Analyze these two dating profiles and generate a compatibility report (be very consise and choose only words that add value). Return ONLY JSON with:
            - Overall rating (0-100)
            - Ratings for interests, personality, and lifestyle
            - A detailed summary
            - Match strengths/weaknesses
            Use format: {
              "overall": 85,
              "categories": {"interests": 90, "personality": 80, "lifestyle": 75},
              "summary": "Detailed match summary...",
              "strengths": ["Common interest 1", "Common interest 2"],
              "weaknesses": ["Potential conflict 1"]
            }`
                        },
                        { role: "user", content: "Profile 1: " + firstProfile.ProfileText },
                        { role: "user", content: "Profile 2: " + secondProfile.ProfileText },
                        { role: "user", content: "Coversation between them " + JSON.stringify(messages) },
                    ],
                    "temperature": 0.0,
                    "response_format": { "type": "json_object" }
                })
            });

            const data = await response.json();
            console.log("Compatibility Report Response:", data); // Log the entire response for debugging


            var string_out = data.choices[0].message.content;
            //strip to the first and ending bracket []

            try {
                string_out = string_out.slice(
                    string_out.indexOf("{"),
                    string_out.lastIndexOf("}") + 1
                );
                var json_out = JSON.parse(string_out);
                return json_out;
            } catch (e) {
                console.error("JSON parse error:", e);
                json_out = ["Couldn't parse conversation"];
                return json_out
            }

        } catch (error) {
            console.error("Compatibility report error:", error);
            return null;
        }
    };


    const simulateConversation = async () => {
        console.log("STARTING SIMULATION");
        setIsLoading(true);
        setMessages([]); // Reset previous messages
        setCompatibilityReport(null); // Reset previous report

        const sample = ['Hey! 👋 Loved your profile!', 'Thanks! 😊 Yours too! What are you up to?', 'Just looking for someone to explore the city with!', 'Perfect match then! 🌆 Favorite coffee spot?']
        var stringified = JSON.stringify(sample);


        const openRouterApiKey = process.env.REACT_APP_OPENROUTER;

        if (!openRouterApiKey) {
            console.error("Error: REACT_APP_OPENROUTER environment variable is not defined.  Please set your OpenRouter API key.");
            return; // Or handle the error appropriately
        }


        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + openRouterApiKey,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "google/gemma-3-27b-it:free",
                    "messages": [
                        {
                            role: "system",
                            content: `You are a dating conversation simulator. You will be given two dating profiles and must generate a realistic, hypothetical conversation between them.

                Follow these rules EXACTLY:

                1.  Return ONLY JSON. Do NOT include any introductory or concluding text.
                2.  Use the following JSON format:
                ${stringified}

                3.  Be realistic, given the profiles. It does not always have to be a positive, lively conversation,  it must be realistic. For example, it may be possible one person says, "oh what bro i dont like that" or something. 
                3.5 be blunt, genz, and realstiic, Use real text messages as info - dont be in a fairtale land making up a happy cheerful convo always yk. talk in the same style as the dating doc of each person respectively.
                4.  Keep the conversation relatively short (10-15 turns).`
                        },
                        { role: "user", content: "###### This is the Dating Doc Of User 1 ####### " + firstProfile.ProfileText },
                        { role: "user", content: "###### This is the Dating Doc Of User 2 ####### " + secondProfile.ProfileText }
                    ],
                    "temperature": 0.0,
                    "response_format": { "type": "json_object" }
                })
            });

            if (!response.ok) {
                console.error("OpenRouter API Error:", response.status, response.statusText);
                const errorText = await response.text();
                console.error("Error Body:", errorText);
                throw new Error(`OpenRouter API failed with status ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("OpenRouter API Response:", data); // Log the entire response for debugging

            var string_out = data.choices[0].message.content;
            //strip to the first and ending bracket []

            try {
                string_out = string_out.slice(
                    string_out.indexOf("["),
                    string_out.lastIndexOf("]") + 1
                );
                var json_out = JSON.parse(string_out);
            } catch (e) {
                console.error("JSON parse error:", e);
                json_out = ["Couldn't parse conversation"];
            }

            setMessages(json_out);
            const report = await generateCompatibilityReport();

            setCompatibilityReport(report);



            console.log("DONE WITH SIM")

            // Process the data here
        } catch (error) {
            console.error("Fetch Error:", error);
        }
        finally {
            setIsLoading(false);
        }


    };


    return (
        <div className="h-screen bg-gradient-to-br from-blue-100 to-purple-100 w-full">
            {!showConvo ? (
                <div className="flex h-full w-full">
                    {/* Left Side */}
                    <div className="w-1/2 relative h-full">
                        <div className="absolute top-4 left-4 right-4">
                            {firstProfile && (
                                <div className="bg-white p-6 rounded-3xl shadow-xl mb-4">
                                    <h2 className="text-2xl font-bold text-teal-600">{firstProfile.Name}</h2>
                                    <p className="text-gray-600">🎂 {firstProfile.Age}, 📍 {firstProfile.Location}</p>
                                    <p className="text-gray-600">🧑 {firstProfile.Gender}, ❤️ {firstProfile.InterestedIn}</p>
                                    <p className="text-gray-600"> Matched with {firstProfile.matches.length} other people!</p>
                                    <a className="text-blue-600" href={firstProfile.ProfileLink}> Dating Doc</a>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleFirstSpin}
                            className="w-full h-full bg-gradient-to-r from-purple-500 to-blue-500 
                            flex items-center justify-center text-white text-4xl font-bold"
                        >
                            SPIN PROFILE
                        </button>
                    </div>

                    {/* Right Side */}
                    <div className="w-1/2 relative h-full">
                        <div className="absolute top-4 right-4 left-4 z-20">
                            {secondProfile && (
                                <div className="bg-white p-6 rounded-3xl shadow-xl mb-4">
                                    <h2 className="text-2xl font-bold text-teal-600">{secondProfile.Name}</h2>
                                    <p className="text-gray-600">🎂 {secondProfile.Age}, 📍 {secondProfile.Location}</p>
                                    <p className="text-gray-600">🧑 {secondProfile.Gender}, ❤️ {secondProfile.InterestedIn}</p>
                                    <p className="text-gray-600"> Matched with {secondProfile.matches.length} other people!</p>
                                    <a className="text-blue-600" href={secondProfile.ProfileLink}> Dating Doc</a>
                                </div>
                            )}
                        </div>
                        <div className="h-full flex flex-col relative">
                            <button
                                onClick={handleSecondSpin}
                                className="w-full h-full bg-gradient-to-r from-green-400 to-yellow-300 
                                flex items-center justify-center text-white text-4xl font-bold"
                                disabled={!firstProfile}
                            >
                                SPIN MATCH
                            </button>

                            {showSimulateButton && (
                                <div className="absolute bottom-0 left-0 right-0 px-8 pb-8 z-10">
                                    <button
                                        onClick={async () => {
                                            setShowConvo(true);
                                            simulateConversation();
                                        }}
                                        className="w-full bg-pink-500 text-white px-8 py-4 rounded-2xl text-xl
            transition-colors shadow-lg hover:bg-pink-600"
                                    >
                                        🕊️ Simulate Date Conversation
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full p-8 flex flex-col">
                    <button
                        onClick={handleRestart}
                        className="bg-purple-500 text-white px-6 py-3 rounded-full mb-8 
                        transition-colors self-start hover:bg-purple-600"
                    >
                        🔄 Restart with New People
                    </button>


                    <div className="flex-1 flex gap-8 h-[calc(100vh-160px)]">
                        {/* Chat Container */}

                        <div className="flex-1 bg-white rounded-2xl shadow-xl p-6 flex flex-col">
                            <span>
                                <a href={firstProfile.ProfileLink} className="text-2xl font-bold text-purple-600 mb-6 hover:text-purple-900">{firstProfile.Name}</a>  and  <a href={secondProfile.ProfileLink} className="text-2xl font-bold text-purple-600 mb-6 hover:text-purple-900">{secondProfile.Name}</a>

                            </span>

                            <div className="flex-1 space-y-4 overflow-y-auto mb-4 mt-4">
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                                        <p className="ml-2 text-gray-600">Simulating conversation...</p>
                                    </div>
                                ) : (
                                    messages.map((message, index) => (
                                        <div
                                            key={index}
                                            className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                                        >
                                            <div
                                                className={`max-w-md p-4 rounded-3xl ${index % 2 === 0
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-green-100 text-green-800'
                                                    }`}
                                            >
                                                {message}
                                            </div>
                                        </div>
                                    ))
                                )}

                            </div>
                        </div>


                        {/* Compatibility Stats */}
                        <div className="w-96 bg-white rounded-2xl shadow-xl p-6 flex flex-col h-full overflow-y-scroll">
                            <h2 className="text-2xl font-bold text-purple-600 mb-6">Compatibility Analysis</h2>
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                                    <p className="ml-2 text-gray-600">Analyzing match...</p>
                                </div>
                            ) : compatibilityReport ? (
                                <div className="flex flex-col h-full">
                                    {/* Ratings Section */}
                                    <div className="space-y-4 flex-none">
                                        <div>
                                            <p className="text-gray-600">Overall Match</p>
                                            <div className="h-2 bg-gray-200 rounded-full">
                                                <div className="h-2 bg-purple-500 rounded-full"
                                                    style={{ width: `${compatibilityReport.overall}%` }}></div>
                                            </div>
                                        </div>
                                        {Object.entries(compatibilityReport.categories).map(([key, value]) => (
                                            <div key={key}>
                                                <p className="text-gray-600 capitalize">{key}</p>
                                                <div className="h-2 bg-gray-200 rounded-full">
                                                    <div className="h-2 bg-blue-400 rounded-full"
                                                        style={{ width: `${value}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <p className="text-gray-600 leading-relaxed mt-4">{compatibilityReport.summary}</p>

                                    <div className="grid grid-cols-2 gap-8 mt-4">
                                        <div>
                                            <p className="font-semibold text-green-600 text-lg mb-2">Strengths</p>
                                            <ul className="list-disc pl-6 space-y-2">
                                                {compatibilityReport.strengths.map((s, i) => (
                                                    <li key={i} className="text-green-600">{s}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <p className="font-semibold text-red-600 text-lg mb-2">Weaknesses</p>
                                            <ul className="list-disc pl-6 space-y-2">
                                                {compatibilityReport.weaknesses.map((w, i) => (
                                                    <li key={i} className="text-red-600">{w}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>


                                </div>
                            ) : (
                                <p className="text-gray-500">No compatibility data available</p>
                            )}


                        </div>
                    </div>


                </div>
            )}


        </div>
    );
}

export default App;