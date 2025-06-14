import React, { useState, useEffect } from 'react';

// Main App component for the Veo 3 Prompt Generator
const App = () => {
    // State variables for all user inputs
    const [sceneDescription, setSceneDescription] = useState(''); // Detailed description of the scene
    const [subjectFocus, setSubjectFocus] = useState('');       // Main subject of the video
    const [cameraMovements, setCameraMovements] = useState(''); // Desired camera actions
    const [visualStyle, setVisualStyle] = useState('');         // Overall artistic style
    const [timeOfDay, setTimeOfDay] = useState('Day');          // Time of day setting
    const [genre, setGenre] = useState('Sci-fi');               // Video genre
    const [lightingConditions, setLightingConditions] = useState('Soft'); // Lighting mood
    const [additionalKeywords, setAdditionalKeywords] = useState(''); // Extra descriptive words
    const [textToSpeech, setTextToSpeech] = useState('');       // Text to be converted to speech in video
    const [videoFormat, setVideoFormat] = useState('landscape'); // Output video aspect ratio

    // State for the generated prompt, loading status, errors, and copy message
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copyMessage, setCopyMessage] = useState(''); // Corrected state setter name

    // State to indicate if authentication is ready for API calls
    // In a production Canvas environment, Firebase auth would initialize here.
    // For local testing and replicating the static site, we assume readiness quickly.
    const [isAuthReady, setIsAuthReady] = useState(false);

    // Effect hook for initial setup and simulating auth readiness
    useEffect(() => {
        // This simulates the authentication readiness without actual Firebase calls
        // to make the UI immediately functional for prompt generation.
        // In a real Canvas app, you'd have Firebase initialization and auth state
        // listeners here (as in previous versions of the code).
        const timer = setTimeout(() => {
            setIsAuthReady(true);
        }, 100); // Small delay to simulate async init
        return () => clearTimeout(timer);
    }, []);

    /**
     * Function to generate the comprehensive video prompt using the Gemini API.
     * It constructs a detailed prompt string based on all user inputs.
     */
    const generatePrompt = async () => {
        // Clear previous state messages before a new generation
        setGeneratedPrompt('');
        setError('');
        setCopyMessage(''); // Use setCopyMessage consistently
        setIsLoading(true); // Activate loading indicator

        // Construct the detailed prompt for the AI model
        const promptText = `Generate a highly creative, detailed, and visually rich text prompt for an AI video generator like Veo 3. The prompt should aim for maximum video quality and artistic expression, incorporating all specified elements.

        Here are the inputs:
        - Scene Description: ${sceneDescription || 'A captivating and dynamic scene'}
        - Subject Focus: ${subjectFocus || 'A central, engaging figure or object'}
        - Camera Movements: ${cameraMovements || 'Sophisticated and fluid camera work (e.g., cinematic tracking shot, slow push-in, dynamic drone view)'}
        - Visual Style: ${visualStyle || 'A visually stunning and coherent artistic style (e.g., hyperrealistic, fantastical, neo-noir, intricate anime)'}
        - Time of Day: ${timeOfDay}
        - Genre: ${genre}
        - Lighting Conditions: ${lightingConditions || 'Artful and evocative lighting'}
        - Additional Keywords: ${additionalKeywords || 'Incorporate rich textures, vibrant colors, atmospheric effects (e.g., volumetric fog, lens flares), detailed reflections, high fidelity, 8K, highly detailed, photorealistic render'}
        - Text-to-Speech: ${textToSpeech ? `Integrate the following dialogue naturally into the video concept: "${textToSpeech}"` : 'No spoken dialogue specified.'}
        - Video Format: ${videoFormat}

        The final prompt should be a concise yet powerful single sentence or short paragraph, directly usable for a video generation model. It should focus on actionable visual and auditory elements, camera direction, and overall mood. Prioritize visual fidelity and artistic depth.

        Example output format: "A majestic golden dragon soaring gracefully through a swirling nebula, seen from a sweeping cinematic drone shot, in a fantastical and ethereal style. Time of Day: Night, Genre: Fantasy, Lighting: Dramatic. Incorporate glowing particles and shimmering stardust, 8K. Text-to-speech: 'Witness the ancient power!' Video Format: landscape."
        `;

        try {
            // Prepare chat history for the Gemini API call
            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: promptText }] });

            // Construct the API payload
            const payload = { contents: chatHistory };
            const apiKey = ""; // API key is automatically provided by Canvas at runtime
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            // Make the API call to Gemini
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Handle non-OK HTTP responses
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API error: ${response.status} ${response.statusText} - ${errorData?.error?.message || 'Unknown error'}`);
            }

            // Parse the API response
            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setGeneratedPrompt(text); // Set the generated prompt
            } else {
                setError('Failed to generate prompt: No valid content from API.');
            }
        } catch (err) {
            console.error("Error generating prompt:", err);
            setError(`Error generating prompt: ${err.message}`); // Display error to user
        } finally {
            setIsLoading(false); // Deactivate loading indicator
        }
    };

    /**
     * Function to copy the generated prompt to the user's clipboard.
     * Uses document.execCommand for broader compatibility within iframes.
     */
    const copyToClipboard = () => {
        if (generatedPrompt) {
            try {
                const textArea = document.createElement('textarea');
                textArea.value = generatedPrompt;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy'); // Execute copy command
                document.body.removeChild(textArea); // Clean up the temporary textarea
                setCopyMessage('Prompt disalin!'); // Use setCopyMessage consistently
                setTimeout(() => setCopyMessage(''), 3000); // Clear message after 3 seconds
            } catch (err) {
                console.error('Gagal menyalin:', err);
                setCopyMessage('Gagal menyalin prompt.'); // Use setCopyMessage consistently
            }
        }
    };

    return (
        // Main container with dark gradient background and centering
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-pink-950 flex items-center justify-center p-4 font-sans antialiased text-gray-200">
            {/* Tailwind CSS and Inter font are linked in public/index.html for local setup.
                In Canvas, they are handled automatically or can be placed here. */}
            {/* Custom styles for scrollbar and select dropdowns */}
            <style>
                {`
                /* Ensure body font is Inter */
                body {
                    font-family: 'Inter', sans-serif;
                }
                /* Custom scrollbar styling for textareas */
                textarea::-webkit-scrollbar {
                    width: 8px;
                }
                textarea::-webkit-scrollbar-track {
                    background: #333; /* Darker track for dark theme */
                    border-radius: 10px;
                }
                textarea::-webkit-scrollbar-thumb {
                    background: #666; /* Lighter thumb */
                    border-radius: 10px;
                }
                textarea::-webkit-scrollbar-thumb:hover {
                    background: #888; /* Even lighter on hover */
                }
                /* Custom styling for select dropdowns to remove default arrow and add custom one */
                select {
                    appearance: none;
                    -webkit-appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 0.7rem center;
                    background-size: 1.5em 1.5em;
                }
                `}
            </style>

            {/* Main content container with dark background, rounded corners, and shadow */}
            <div className="bg-gray-800 bg-opacity-90 p-8 rounded-2xl shadow-lg w-full max-w-3xl transform transition-all duration-300 border border-purple-700 hover:shadow-2xl">
                {/* Application title */}
                <h1 className="text-4xl font-extrabold text-center text-white mb-8 drop-shadow-lg">
                    Veo 3 Prompt Generator
                </h1>

                {/* Error message display */}
                {error && (
                    <div className="bg-red-800 border border-red-600 text-red-200 px-4 py-3 rounded relative mb-6" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}

                {/* Grid layout for input fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Scene Description input */}
                    <div className="flex flex-col">
                        <label htmlFor="sceneDescription" className="text-lg font-semibold text-gray-300 mb-2">Deskripsi Adegan:</label>
                        <textarea
                            id="sceneDescription"
                            className="w-full p-3 border border-purple-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200 resize-y min-h-[60px] bg-gray-700 text-white placeholder-gray-400"
                            rows="2"
                            placeholder="Contoh: Sebuah kota yang futuristik dan ramai di malam hari..."
                            value={sceneDescription}
                            onChange={(e) => setSceneDescription(e.target.value)}
                        />
                    </div>
                    {/* Subject Focus input */}
                    <div className="flex flex-col">
                        <label htmlFor="subjectFocus" className="text-lg font-semibold text-gray-300 mb-2">Fokus Subjek:</label>
                        <textarea
                            id="subjectFocus"
                            className="w-full p-3 border border-purple-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200 resize-y min-h-[60px] bg-gray-700 text-white placeholder-gray-400"
                            rows="2"
                            placeholder="Contoh: Seorang detektif yang kesepian, robot yang sedang berpatroli..."
                            value={subjectFocus}
                            onChange={(e) => setSubjectFocus(e.target.value)}
                        />
                    </div>
                    {/* Camera Movements input */}
                    <div className="flex flex-col">
                        <label htmlFor="cameraMovements" className="text-lg font-semibold text-gray-300 mb-2">Pergerakan Kamera:</label>
                        <textarea
                            id="cameraMovements"
                            className="w-full p-3 border border-purple-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200 resize-y min-h-[60px] bg-gray-700 text-white placeholder-gray-400"
                            rows="2"
                            placeholder="Contoh: Pan perlahan, zoom in cepat, sudut rendah dramatis..."
                            value={cameraMovements}
                            onChange={(e) => setCameraMovements(e.target.value)}
                        />
                    </div>
                    {/* Visual Style input */}
                    <div className="flex flex-col">
                        <label htmlFor="visualStyle" className="text-lg font-semibold text-gray-300 mb-2">Gaya Visual:</label>
                        <textarea
                            id="visualStyle"
                            className="w-full p-3 border border-purple-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200 resize-y min-h-[60px] bg-gray-700 text-white placeholder-gray-400"
                            rows="2"
                            placeholder="Contoh: Sinematik, cyberpunk, fantasi gelap, seni piksel..."
                            value={visualStyle}
                            onChange={(e) => setVisualStyle(e.target.value)}
                        />
                    </div>
                    {/* Time of Day dropdown */}
                    <div className="flex flex-col">
                        <label htmlFor="timeOfDay" className="text-lg font-semibold text-gray-300 mb-2">Waktu Hari:</label>
                        <select
                            id="timeOfDay"
                            className="w-full p-3 border border-purple-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200 bg-gray-700 text-white"
                            value={timeOfDay}
                            onChange={(e) => setTimeOfDay(e.target.value)}
                        >
                            <option value="Day">Siang</option>
                            <option value="Night">Malam</option>
                            <option value="Sunset">Matahari Terbenam</option>
                            <option value="Sunrise">Matahari Terbit</option>
                        </select>
                    </div>
                    {/* Genre dropdown */}
                    <div className="flex flex-col">
                        <label htmlFor="genre" className="text-lg font-semibold text-gray-300 mb-2">Genre:</label>
                        <select
                            id="genre"
                            className="w-full p-3 border border-purple-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200 bg-gray-700 text-white"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                        >
                            <option value="Sci-fi">Fiksi Ilmiah</option>
                            <option value="Fantasy">Fantasi</option>
                            <option value="Horror">Horor</option>
                            <option value="Comedy">Komedi</option>
                            <option value="Action">Aksi</option>
                            <option value="Documentary">Dokumenter</option>
                        </select>
                    </div>
                    {/* Lighting Conditions dropdown */}
                    <div className="flex flex-col">
                        <label htmlFor="lightingConditions" className="text-lg font-semibold text-gray-300 mb-2">Kondisi Pencahayaan:</label>
                        <select
                            id="lightingConditions"
                            className="w-full p-3 border border-purple-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200 bg-gray-700 text-white"
                            value={lightingConditions}
                            onChange={(e) => setLightingConditions(e.target.value)}
                        >
                            <option value="Soft">Lembut</option>
                            <option value="Harsh">Keras</option>
                            <option value="Dramatic">Dramatis</option>
                            <option value="Natural">Alami</option>
                        </select>
                    </div>
                     {/* Video Format dropdown */}
                    <div className="flex flex-col">
                        <label htmlFor="videoFormat" className="text-lg font-semibold text-gray-300 mb-2">Format Video:</label>
                        <select
                            id="videoFormat"
                            className="w-full p-3 border border-purple-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200 bg-gray-700 text-white"
                            value={videoFormat}
                            onChange={(e) => setVideoFormat(e.target.value)}
                        >
                            <option value="landscape">Lanskap (16:9)</option>
                            <option value="portrait">Potret (9:16)</option>
                        </select>
                    </div>
                    {/* Text-to-Speech input (full width on md and above) */}
                    <div className="md:col-span-2 flex flex-col">
                        <label htmlFor="textToSpeech" className="text-lg font-semibold text-gray-300 mb-2">Teks untuk Pidato (opsional):</label>
                        <textarea
                            id="textToSpeech"
                            className="w-full p-3 border border-purple-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200 resize-y min-h-[60px] bg-gray-700 text-white placeholder-gray-400"
                            rows="2"
                            placeholder="Contoh: 'Selamat datang di dunia yang menakjubkan ini!'"
                            value={textToSpeech}
                            onChange={(e) => setTextToSpeech(e.target.value)}
                        />
                    </div>
                    {/* Additional Keywords input (full width on md and above) */}
                    <div className="md:col-span-2 flex flex-col">
                        <label htmlFor="keywords" className="text-lg font-semibold text-gray-300 mb-2">Kata Kunci Tambahan (opsional):</label>
                        <textarea
                            id="keywords"
                            className="w-full p-3 border border-purple-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200 resize-y min-h-[60px] bg-gray-700 text-white placeholder-gray-400"
                            rows="2"
                            placeholder="Contoh: Gerakan lambat, cahaya dramatis, pemandangan udara, hujan..."
                            value={additionalKeywords}
                            onChange={(e) => setAdditionalKeywords(e.target.value)}
                        />
                    </div>
                </div>

                {/* Generate Prompt Button */}
                <button
                    onClick={generatePrompt}
                    disabled={isLoading || !isAuthReady} // Disable if loading or not ready
                    className={`w-full py-4 px-6 rounded-lg text-white font-bold text-xl shadow-lg transform transition duration-300
                                ${isLoading || !isAuthReady ? 'bg-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-800 hover:to-pink-800 active:scale-95'}`}
                >
                    {isLoading ? ( // Show loading spinner if loading
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Membuat Prompt...
                        </div>
                    ) : (
                        'Buat Prompt Veo 3' // Button text when not loading
                    )}
                </button>

                {/* Display Area for Generated Prompt */}
                {generatedPrompt && (
                    <div className="mt-8 bg-gray-900 bg-opacity-70 p-6 rounded-lg shadow-inner border border-purple-700">
                        <h2 className="text-2xl font-bold text-white mb-4">Prompt Anda:</h2>
                        <div className="relative">
                            <textarea
                                readOnly // Make textarea read-only
                                className="w-full p-4 border border-pink-500 rounded-lg bg-gray-800 text-white text-lg leading-relaxed font-mono resize-y min-h-[120px] max-h-[300px]"
                                rows="5"
                                value={generatedPrompt}
                            ></textarea>
                            <button
                                onClick={copyToClipboard}
                                className="absolute top-2 right-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md"
                            >
                                Salin
                            </button>
                            {/* Copy success/error message */}
                            {copyMessage && (
                                <span className="absolute -top-8 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-sm animate-fade-in-out">
                                    {copyMessage}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-400 mt-4">
                            Tips: Anda dapat menyalin prompt ini dan memasukkannya langsung ke Veo 3.
                        </p>
                    </div>
                )}

                {/* YouTube Channel Link */}
                <div className="mt-8 text-center">
                    <a
                        href="https://www.youtube.com/@live_ndeso"
                        target="_blank" // Open in new tab
                        rel="noopener noreferrer" // Security best practice
                        className="text-purple-400 hover:text-pink-400 text-lg font-medium transition duration-300"
                    >
                       subscribe my youtube @live_ndeso
                    </a>
                </div>
            </div>
        </div>
    );
};

export default App;
