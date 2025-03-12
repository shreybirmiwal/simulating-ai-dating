import React, { useState, useEffect } from 'react';
import { profiles } from './profiles';

function App() {
    const [firstProfile, setFirstProfile] = useState(null);
    const [secondProfile, setSecondProfile] = useState(null);
    const [showConvo, setShowConvo] = useState(false);
    const [messages, setMessages] = useState([]);
    const [showSimulateButton, setShowSimulateButton] = useState(false);

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
            const matches = JSON.parse(firstProfile.matches);
            const randomMatchId = matches[Math.floor(Math.random() * matches.length)];
            const matchProfile = profiles.find(profile => profile.ID === randomMatchId);
            setSecondProfile(matchProfile);
            setShowSimulateButton(true);
        }
    };

    const simulateConversation = () => {
        const convo = [
            { sender: 'user1', text: 'Hey! 👋 Loved your profile!', delay: 500 },
            { sender: 'user2', text: 'Thanks! 😊 Yours too! What are you up to?', delay: 1500 },
            { sender: 'user1', text: 'Just looking for someone to explore the city with!', delay: 2500 },
            { sender: 'user2', text: 'Perfect match then! 🌆 Favorite coffee spot?', delay: 3500 },
        ];

        convo.forEach((msg, index) => {
            setTimeout(() => {
                setMessages(prev => [...prev, { id: index, ...msg }]);
            }, msg.delay);
        });
    };

    useEffect(() => {
        if (showConvo) simulateConversation();
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
                                        onClick={() => setShowConvo(true)}
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
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.sender === 'user1' ? 'justify-start' : 'justify-end'}`}
                                    >
                                        <div
                                            className={`max-w-md p-4 rounded-3xl ${message.sender === 'user1'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}
                                        >
                                            {message.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Compatibility Stats */}
                        <div className="w-96 bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-2xl font-bold text-purple-600 mb-6">Compatibility Analysis</h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-gray-600">Interest Match</p>
                                    <div className="h-2 bg-gray-200 rounded-full">
                                        <div className="h-2 bg-green-400 rounded-full w-4/5"></div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-600">Personality Match</p>
                                    <div className="h-2 bg-gray-200 rounded-full">
                                        <div className="h-2 bg-blue-400 rounded-full w-3/4"></div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-600">Location Proximity</p>
                                    <div className="h-2 bg-gray-200 rounded-full">
                                        <div className="h-2 bg-yellow-400 rounded-full w-9/10"></div>
                                    </div>
                                </div>
                                <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                                    <p className="font-semibold text-purple-600">Summary</p>
                                    <p className="text-gray-600 mt-2">
                                        92% match! Both love outdoor activities and share similar values.
                                        High potential for a great connection!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;