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
                            content: `Analyze these two dating profiles and generate a compatibility report. Return ONLY JSON with:
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
                        { role: "user", content: "Profile 2: " + secondProfile.ProfileText }
                    ],
                    "temperature": 0.0,
                    "response_format": { "type": "json_object" }
                })
            });

            const data = await response.json();
            const report = JSON.parse(data.choices[0].message.content);
            return report;
        } catch (error) {
            console.error("Compatibility report error:", error);
            return null;
        }
    };


    const simulateConversation = async () => {
        setIsLoading(true);

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
                3.5 be blunt, genz, and realstiic, Use real text messages as info - dont be in a fairtale land making up a happy cheerful convo always yk
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

            string_out = string_out.slice(string_out.indexOf("["), string_out.lastIndexOf("]") + 1);
            var json_out = JSON.parse(string_out);

            console.log("JSON Output:", json_out);

            setMessages(json_out);
            const report = await generateCompatibilityReport();
            setCompatibilityReport(report);
            // Process the data here
        } catch (error) {
            console.error("Fetch Error:", error);
        }
        finally {
            setIsLoading(false);
        }

        // try {

        //     // console.log("starting stream")
        //     // console.log('firstProfile', firstProfile.ProfileText)
        //     // console.log('secondProfile', secondProfile.ProfileText)
        //     // console.log('stringified', stringified)
        //     // console.log("starting stream")
        //     // const stream = await client.chat.completions.create({
        //     //     model: "deepseek-ai/DeepSeek-V3",
        //     //     stream: true,
        //     //     messages: [
        //     //         { role: "system", content: "You will be given 2 users dating profile. Your job is to come up with a hypothethical conversation between these 2 users (put it into an array), being realistic and utilizing a realtiic convo given what you know about them. You must return in STRICT JSON OUTPUT FORMAT, following the given format (note teh back and forth array with no extra info) example, without giving any extra start or end tokens: " + { stringified } },
        //     //         { role: "user", content: "###### This is the Dating Doc Of User 1 ####### " + firstProfile.ProfileText },
        //     //         { role: "user", content: "###### This is the Dating Doc Of User 2 ####### " + secondProfile.ProfileText }
        //     //     ],
        //     //     temperature: 0.0,
        //     //     max_tokens: 6000,

        //     // });
        //     // console.log("parsing tokens")
        //     // var total = ""
        //     // for await (const chunk of stream) {
        //     //     const content = chunk.choices[0]?.delta?.content || "";
        //     //     total += content
        //     //     // console.log(content)
        //     // }
        //     // console.log("Done gathering tokens")
        //     // console.log(total);
        //     // const convo = JSON.parse(total);
        //     // setMessages(convo);


        //     console.log("KEY", process.env.REACT_APP_OPENROUTER)
        //     var out = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        //         method: "POST",
        //         headers: {
        //             "Authorization": "Bearer " + process.env.REACT_APP_OPENROUTER,
        //             "Content-Type": "application/json"
        //         },
        //         body: JSON.stringify({
        //             "model": "meta-llama/llama-3.1-8b-instruct:free",
        //             "messages": [
        //                 { role: "system", content: "You will be given 2 users dating profile. Your job is to come up with a hypothethical conversation between these 2 users (put it into an array), being realistic and utilizing a realtiic convo given what you know about them. You must return in STRICT JSON OUTPUT FORMAT, following the given format (note teh back and forth array with no extra info) example, without giving any extra start or end tokens: " + { stringified } },
        //                 { role: "user", content: "###### This is the Dating Doc Of User 1 ####### " + firstProfile.ProfileText },
        //                 { role: "user", content: "###### This is the Dating Doc Of User 2 ####### " + secondProfile.ProfileText }
        //             ],
        //             "temperature": 0.0,
        //         })
        //     });

        //     console.log(out)

        // } catch (error) {
        //     console.error('Error:', error);
        // }

    };

    useEffect(() => {
        // Remove the async here and handle async logic properly
        let isMounted = true;

        const runSimulation = async () => {
            if (showConvo) {
                console.log("start convo sim")

                const convo = await simulateConversation();
                if (isMounted) {
                    setMessages(convo);
                }
            }
        };

        runSimulation();

        return () => {
            isMounted = false; // Cleanup to prevent stale state updates
        };
    }, [showConvo]);

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
                            <div className="flex-1 space-y-4 overflow-y-auto mb-4">
                                {isLoading ? (
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
                                ) : (
                                    <div className="flex justify-center items-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                                        <p className="ml-2 text-gray-600">Simulating conversation...</p>
                                    </div>
                                )}

                            </div>
                        </div>


                        {/* Compatibility Stats */}
                        {/* Compatibility Stats */}
                        <div className="w-96 bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-2xl font-bold text-purple-600 mb-6">Compatibility Analysis</h2>
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                                    <p className="ml-2 text-gray-600">Analyzing match...</p>
                                </div>
                            ) : compatibilityReport ? (
                                <div className="space-y-4">
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
                                    <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                                        <p className="font-semibold text-purple-600">Summary</p>
                                        <p className="text-gray-600 mt-2">{compatibilityReport.summary}</p>
                                        <div className="mt-4">
                                            <p className="font-semibold text-green-600">Strengths</p>
                                            <ul className="list-disc pl-4">
                                                {compatibilityReport.strengths.map((s, i) => (
                                                    <li key={i} className="text-green-600">{s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="mt-2">
                                            <p className="font-semibold text-red-600">Weaknesses</p>
                                            <ul className="list-disc pl-4">
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