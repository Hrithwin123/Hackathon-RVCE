import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Camera, Leaf, CheckCircle, AlertCircle, Loader2, X, Send, MessageCircle, Bot, User } from 'lucide-react';
import Navbar from '../Components/Navbar';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';

const PlantDiseaseUploader = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const {id} = useParams()

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Initialize chat with welcome message when analysis is complete
  useEffect(() => {
    if (analysisResult && chatMessages.length === 0) {
      setChatMessages([
        {
          id: 1,
          type: 'bot',
          message: `Hello! I've analyzed your plant and detected ${analysisResult.disease}. I'm here to help answer any questions you might have about plant care, disease management, or prevention strategies. What would you like to know?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [analysisResult]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setError(null);
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage({
          file,
          preview: reader.result,
          name: file.name,
          size: file.size
        });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const analyzeImage = async () => {
    if (!uploadedImage) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Simulate ML backend call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock response - replace with actual API call
      const mockResponse = {
        disease: "Tomato Late Blight",
        confidence: 92.5,
        severity: "Moderate",
        recommendations: [
          "Remove affected leaves immediately to prevent spread",
          "Apply copper-based fungicide in the evening",
          "Improve air circulation around plants",
          "Avoid overhead watering - water at soil level",
          "Consider organic neem oil treatment as alternative"
        ],
        prevention: [
            "Ensure proper spacing between plants",
          "Plant resistant varieties when possible",
          "Ensure proper spacing between plants",
          "Water early morning to allow leaves to dry",
          "Ensure proper spacing between plants",
          "Apply mulch to prevent soil splash on leaves",
          "Water early morning to allow leaves to dry",
        ]
      };
      
      setAnalysisResult(mockResponse);
    } catch (err) {
      setError("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetUpload = () => {
    setUploadedImage(null);
    setAnalysisResult(null);
    setError(null);
    setIsAnalyzing(false);
    setChatMessages([]);
    setInputMessage('');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: inputMessage.trim(),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsChatLoading(true);

    // Simulate AI response - replace with actual Gemini API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: "Thank you for your question! This is a placeholder response. In the actual implementation, this will be connected to the Gemini chatbot to provide personalized plant care advice based on your specific situation and the analyzed disease.",
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: "Sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* TSParticles Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: {
            enable: true,
            zIndex: 0
          },
          particles: {
            number: {
              value: 30,
              density: {
                enable: true,
                value_area: 800
              }
            },
            color: {
              value: ["#22c55e", "#10b981", "#059669", "#34d399", "#6ee7b7"]
            },
            shape: {
              type: ["circle", "triangle"],
              options: {
                circle: {
                  radius: 6
                },
                triangle: {
                  sides: 5
                }
              }
            },
            opacity: {
              value: 0.2,
              random: true,
              anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.1,
                sync: false
              }
            },
            size: {
              value: 8,
              random: true,
              anim: {
                enable: true,
                speed: 2,
                size_min: 3,
                sync: false
              }
            },
            move: {
              enable: true,
              speed: 0.8,
              direction: "none",
              random: true,
              straight: false,
              outModes: {
                default: "out"
              },
              attract: {
                enable: true,
                rotateX: 600,
                rotateY: 1200
              }
            },
            rotate: {
              value: {
                min: 0,
                max: 360
              },
              direction: "random",
              animation: {
                enable: true,
                speed: 5
              }
            }
          },
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: "grab"
              },
              onClick: {
                enable: true,
                mode: "push"
              }
            },
            modes: {
              grab: {
                distance: 140,
                links: {
                  opacity: 0.3
                }
              },
              push: {
                quantity: 4
              }
            }
          },
          background: {
            color: "transparent"
          }
        }}
      />

      {/* Original Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Floating Elements */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`float-${i}`}
            className="absolute w-16 h-16 rounded-full bg-green-200 opacity-20 animate-float"
            style={{
              top: `${10 + i * 12}%`,
              left: `${10 + i * 10}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${15 + i * 2}s`
            }}
          />
        ))}
        
        {/* Gradient Orbs */}
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 animate-pulse-slow"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, transparent 70%)',
            animationDuration: '8s'
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15 animate-pulse-slow"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
            animationDuration: '10s',
            animationDelay: '1s'
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 animate-pulse-slow"
          style={{
            background: 'radial-gradient(circle, rgba(52, 211, 153, 0.15) 0%, transparent 70%)',
            animationDuration: '12s',
            animationDelay: '2s'
          }}
        />
      </div>

      <Navbar id={id}/>
      <div className="relative max-w-4xl mx-auto p-6 pt-8 z-10">
        <div>
          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full mb-4 backdrop-blur-sm">
              <Leaf className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Plant Disease Detection</h1>
            <p className="text-gray-600">Upload a photo of your plant's leaf to identify diseases and get treatment recommendations</p>
          </div>

          {!uploadedImage && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-6">
              <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive 
                    ? 'border-green-400 bg-green-50 scale-105 shadow-lg' 
                    : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50'
                }`}
              >
                <input {...getInputProps()} />
                
                <div className="space-y-4">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full transition-colors duration-300 ${
                    isDragActive ? 'bg-green-200 text-green-600 scale-110' : 'bg-green-100 text-green-500'
                  }`}>
                    {isDragActive ? (
                      <Camera className="w-8 h-8 animate-bounce" />
                    ) : (
                      <Upload className="w-8 h-8" />
                    )}
                  </div>
                  
                  <div className="transform transition-all duration-300">
                    <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
                      isDragActive ? 'text-green-600' : 'text-gray-800'
                    }`}>
                      {isDragActive ? 'Drop your image here' : 'Upload Plant Leaf Image'}
                    </h3>
                    <p className={`text-gray-600 mb-4 transition-colors duration-300 ${
                      isDragActive ? 'text-green-600' : ''
                    }`}>
                      {isDragActive ? 'Release to upload' : 'Drag and drop an image, or click to browse'}
                    </p>
                    <p className="text-sm text-gray-500">Supports JPG, PNG, WebP • Max size: 10MB</p>
                  </div>
                </div>

                {/* Drag Active Overlay */}
                {isDragActive && (
                  <div className="absolute inset-0 bg-green-50/50 backdrop-blur-sm rounded-xl animate-pulse" />
                )}
              </div>
            </div>
          )}

          {uploadedImage && !analysisResult && (
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 100,
                damping: 15,
                mass: 1
              }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-6"
            >
              <div className="flex items-start gap-6">
                <motion.div 
                  initial={{ scale: 0.8, rotate: -5 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: 0.1
                  }}
                  className="relative"
                >
                  <img
                    src={uploadedImage.preview}
                    alt="Uploaded plant"
                    className="w-32 h-32 object-cover rounded-xl border-2 border-green-200"
                  />
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={resetUpload}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex-1"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Image Ready for Analysis</h3>
                  <p className="text-gray-600 mb-1">{uploadedImage.name}</p>
                  <p className="text-sm text-gray-500 mb-4">{formatFileSize(uploadedImage.size)}</p>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing Plant...
                      </>
                    ) : (
                      <>
                        <Leaf className="w-5 h-5" />
                        Analyze Disease
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </div>
              
              {isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                    <span className="text-green-800 font-medium">AI is analyzing your plant...</span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: "70%" }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="bg-green-500 h-2 rounded-full"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {analysisResult && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 100,
                damping: 20
              }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-6"
            >
              <div className="flex items-start gap-6 mb-8">
                <img
                  src={uploadedImage.preview}
                  alt="Analyzed plant"
                  className="w-24 h-24 object-cover rounded-xl border-2 border-green-200"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <h2 className="text-2xl font-bold text-gray-800">Analysis Complete</h2>
                  </div>
                  <button
                    onClick={resetUpload}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Analyze Another Image →
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                    <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Disease Detected
                    </h3>
                    <p className="text-red-700 font-medium text-xl mb-2">{analysisResult.disease}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-red-600">Confidence: {analysisResult.confidence}%</span>
                      <span className="text-red-600">Severity: {analysisResult.severity}</span>
                    </div>
                  </div>

                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Immediate Actions</h3>
                    <ul className="space-y-3">
                      {analysisResult.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <span className="text-blue-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">Future Prevention</h3>
                  <ul className="space-y-3">
                    {analysisResult.prevention.map((prev, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-green-700">{prev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Chatbot Section */}
          {analysisResult && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Plant Care Assistant</h3>
                  <p className="text-gray-600 text-sm">Ask me anything about your plant's care and treatment</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="bg-gray-50 rounded-xl p-4 h-80 overflow-y-auto mb-4 space-y-4">
                {chatMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      }`}>
                        {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`px-4 py-3 rounded-2xl ${
                        message.type === 'user' 
                          ? 'bg-blue-500 text-white rounded-br-md' 
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                      }`}>
                        <p className="text-sm leading-relaxed">{message.message}</p>
                        <p className={`text-xs mt-2 opacity-70 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3 max-w-[80%]">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-md">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}} />
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}} />
                          <span className="text-sm text-gray-500 ml-2">Assistant is typing...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Chat Input - Fixed alignment */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about plant care, disease prevention, or treatment options..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows="2"
                    disabled={isChatLoading}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isChatLoading}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white p-3 rounded-xl transition-colors flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Question Suggestions */}
              <div className="mt-4 flex flex-wrap gap-2">
                <p className="text-sm text-gray-500 w-full mb-2">Quick questions:</p>
                {[
                  "How often should I water my plant?",
                  "What's the best fertilizer to use?",
                  "How can I prevent this disease?",
                  "When should I prune affected leaves?"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(suggestion)}
                    className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 text-sm rounded-full border border-green-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  <span className="text-red-700 font-medium">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PlantDiseaseUploader;