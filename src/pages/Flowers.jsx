import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Upload, Camera, Leaf, CheckCircle, AlertCircle, Loader2, X, Send, MessageCircle, Bot, User, AlertTriangle } from 'lucide-react';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { chatbotService } from '../services/chatbotService';

const PlantDiseaseUploader = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisState, setAnalysisState] = useState({
    isAnalyzing: false,
    isComplete: false,
    error: null,
    result: null
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const { currentLanguage } = useLanguage();
  const { id } = useParams();
  const [remediesState, setRemediesState] = useState({
    isLoading: false,
    isComplete: false,
    error: null,
    immediateActions: [],
    futurePrevention: []
  });

  // Individual translations using useTranslation hook
  const title = useTranslation("Plant Disease Detection");
  const subtitle = useTranslation("Upload a photo of your plant's leaf to identify diseases and get treatment recommendations");
  const uploadTitle = useTranslation("Upload Plant Photo");
  const dragDropText = useTranslation("Drag and drop your image here");
  const orText = useTranslation("or");
  const browseText = useTranslation("click to browse");
  const uploadButton = useTranslation("Browse Files");
  const analyzing = useTranslation("Analyzing your plant...");
  const diseaseDetected = useTranslation("Disease Detected");
  const confidence = useTranslation("Confidence");
  const severity = useTranslation("Severity");
  const immediateActionsTitle = useTranslation("Immediate Actions");
  const chatTitle = useTranslation("Ask the Plant Expert");
  const chatPlaceholder = useTranslation("Ask me about plant care, disease prevention, or treatment options...");
  const quickQuestions = useTranslation("Quick questions:");
  const wateringQuestion = useTranslation("How often should I water my plant?");
  const fertilizerQuestion = useTranslation("What's the best fertilizer to use?");
  const preventionQuestion = useTranslation("How can I prevent this disease?");
  const pruningQuestion = useTranslation("When should I prune affected leaves?");
  const uploadError = useTranslation("Failed to upload image. Please try again.");
  const analysisError = useTranslation("Failed to analyze image. Please try again.");
  const chatError = useTranslation("Failed to send message. Please try again.");

  // Memoize the translations object to prevent unnecessary re-renders
  const translations = useMemo(() => ({
    title,
    subtitle,
    uploadTitle,
    dragDropText,
    orText,
    browseText,
    uploadButton,
    analyzing,
    diseaseDetected,
    confidence,
    severity,
    immediateActions: immediateActionsTitle,
    chatTitle,
    chatPlaceholder,
    quickQuestions,
    questions: {
      watering: wateringQuestion,
      fertilizer: fertilizerQuestion,
      prevention: preventionQuestion,
      pruning: pruningQuestion
    },
    error: {
      upload: uploadError,
      analysis: analysisError,
      chat: chatError
    }
  }), [
    title, subtitle, uploadTitle, dragDropText, orText, browseText, uploadButton,
    analyzing, diseaseDetected, confidence, severity, immediateActionsTitle,
    chatTitle, chatPlaceholder, quickQuestions, wateringQuestion,
    fertilizerQuestion, preventionQuestion, pruningQuestion,
    uploadError, analysisError, chatError
  ]);

  // Memoize particles config
  const particlesConfig = useMemo(() => ({
    fullScreen: {
      enable: true,
      zIndex: 0
    },
    particles: {
      number: {
        value: 20, // Reduced number of particles
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
  }), []);

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
    if (analysisState.result && chatMessages.length === 0) {
      const welcomeMessage = `Hello! I've analyzed your plant and detected ${analysisState.result.disease}. I'm here to help answer any questions you might have about plant care, disease management, or prevention strategies. What would you like to know?`;
      setChatMessages([
        {
          id: 1,
          type: 'bot',
          message: welcomeMessage,
          timestamp: new Date()
        }
      ]);
    }
  }, [analysisState.result, chatMessages.length]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setAnalysisState(prev => ({
          ...prev,
          error: "Please upload an image file (JPEG, PNG, etc.)"
        }));
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setAnalysisState(prev => ({
          ...prev,
          error: "Image size should be less than 5MB"
        }));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          // Validate image dimensions
          if (img.width < 100 || img.height < 100) {
            setAnalysisState(prev => ({
              ...prev,
              error: "Image dimensions should be at least 100x100 pixels"
            }));
            return;
          }
          setUploadedImage({
            file,
            preview: reader.result
          });
        };
        img.onerror = () => {
          setAnalysisState(prev => ({
            ...prev,
            error: "Failed to load image. Please try again."
          }));
        };
        img.src = reader.result;
      };
      reader.onerror = () => {
        setAnalysisState(prev => ({
          ...prev,
          error: "Failed to read image file. Please try again."
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const analyzeImage = useCallback(async () => {
    if (!uploadedImage?.file) {
      setAnalysisState(prev => ({
        ...prev,
        error: "No image to analyze. Please upload an image first."
      }));
      return;
    }
    
    // Reset states
    setAnalysisState({
      isAnalyzing: true,
      isComplete: false,
      error: null,
      result: null
    });
    
    setRemediesState({
      isLoading: false,
      isComplete: false,
      error: null,
      immediateActions: [],
      futurePrevention: []
    });
    
    try {
      // Create FormData for image upload
      const formData = new FormData();
      formData.append('image', uploadedImage.file);

      // Send image to backend for analysis
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Update analysis state with the result
      setAnalysisState(prev => ({
        ...prev,
        isAnalyzing: false,
        isComplete: true,
        result: {
          disease: result.disease,
          confidence: result.confidence
        }
      }));

      // Update remedies state with the response
      setRemediesState({
        isLoading: false,
        isComplete: true,
        error: null,
        immediateActions: result.immediateActions || [],
        futurePrevention: result.futurePrevention || []
      });

    } catch (err) {
      console.error("Analysis error:", err);
      setAnalysisState({
        isAnalyzing: false,
        isComplete: true,
        error: err.message || "Failed to analyze image. Please try again.",
        result: null
      });
    }
  }, [uploadedImage]);

  const resetUpload = () => {
    setUploadedImage(null);
    setAnalysisState({
      isAnalyzing: false,
      isComplete: false,
      error: null,
      result: null
    });
    setRemediesState({
      isLoading: false,
      isComplete: false,
      error: null,
      immediateActions: [],
      futurePrevention: []
    });
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

    try {
      // Prepare context with disease analysis results if available
      const context = analysisState.result ? {
        disease: analysisState.result.disease,
        severity: analysisState.result.severity,
        recommendations: analysisState.result.recommendations,
        prevention: analysisState.result.prevention
      } : {};

      // Send message to chatbot
      const response = await chatbotService.sendMessage(inputMessage.trim(), context);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: response.reply,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: translations.error.chat,
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

  // Add this component for rendering formatted messages
  const FormattedMessage = ({ message }) => {
    return (
      <div 
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ 
          __html: message
            .replace(/<h3>/g, '<h3 class="text-lg font-bold text-gray-800 mt-4 mb-2">')
            .replace(/<h4>/g, '<h4 class="text-base font-semibold text-gray-700 mt-3 mb-1">')
            .replace(/<strong>/g, '<strong class="font-semibold text-gray-800">')
            .replace(/<em>/g, '<em class="italic text-gray-700">')
            .replace(/<ul>/g, '<ul class="list-disc pl-4 space-y-1 my-2">')
            .replace(/<ol>/g, '<ol class="list-decimal pl-4 space-y-1 my-2">')
            .replace(/<li>/g, '<li class="text-gray-700">')
            .replace(/<br>/g, '<br class="my-1">')
        }} 
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* TSParticles Background with reduced complexity */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: true, zIndex: 0 },
          particles: {
            number: { value: 15, density: { enable: true, value_area: 800 } },
            color: { value: ["#22c55e", "#10b981"] },
            shape: { type: "circle" },
            opacity: { value: 0.1, random: true },
            size: { value: 6, random: true },
            move: { enable: true, speed: 0.5, direction: "none", random: true },
            background: { color: "transparent" }
          },
          interactivity: { events: { onHover: { enable: false } } }
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

      <div className="relative max-w-4xl mx-auto p-6 pt-8 z-10">
        <div>
          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full mb-4 backdrop-blur-sm">
              <Leaf className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
            <p className="text-gray-600">{subtitle}</p>
          </div>

          {!uploadedImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-6"
            >
              <motion.div
                {...getRootProps()}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive 
                    ? 'border-green-400 bg-green-50 scale-105 shadow-lg' 
                    : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50'
                }`}
              >
                <input {...getInputProps()} />
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div 
                    className="flex justify-center"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  >
                    <motion.div
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Upload className="w-12 h-12 text-green-500" />
                    </motion.div>
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.h3 
                      className="text-lg font-semibold text-gray-800 mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {uploadTitle}
                    </motion.h3>
                    <motion.p 
                      className="text-gray-600 mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      {dragDropText} <span className="text-gray-500">{orText}</span> {browseText}
                    </motion.p>
                    <motion.button
                      type="button"
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      {uploadButton}
                    </motion.button>
                  </motion.div>
                </motion.div>
                
                {/* Animated border effect when dragging */}
                {isDragActive && (
                  <motion.div
                    className="absolute inset-0 border-2 border-green-400 rounded-xl"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.div>
            </motion.div>
          )}

          {uploadedImage && !analysisState.result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
                  <motion.img
                    src={uploadedImage.preview}
                    alt="Uploaded plant"
                    className="w-32 h-32 object-cover rounded-xl border-2 border-green-200"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.05 }}
                  />
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
                    onClick={resetUpload}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex-1"
                >
                  <motion.h3 
                    className="text-lg font-semibold text-gray-800 mb-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Image Ready for Analysis
                  </motion.h3>
                  <motion.p 
                    className="text-gray-600 mb-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {uploadedImage.file.name}
                  </motion.p>
                  <motion.p 
                    className="text-sm text-gray-500 mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    {formatFileSize(uploadedImage.file.size)}
                  </motion.p>
                  
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={analyzeImage}
                    disabled={analysisState.isAnalyzing}
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-6 py-3 rounded-lg font-semibold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    {analysisState.isAnalyzing ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2"
                      >
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {analyzing}
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2"
                      >
                        <Leaf className="w-5 h-5" />
                        Analyze Disease
                      </motion.div>
                    )}
                  </motion.button>
                </motion.div>
              </div>
              
              {analysisState.isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200"
                >
                  <motion.div 
                    className="flex items-center gap-3 mb-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                    <span className="text-green-800 font-medium">AI is analyzing your plant...</span>
                  </motion.div>
                  <div className="w-full bg-green-200 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: "70%" }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                      }}
                      className="bg-green-500 h-2 rounded-full"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {analysisState.result && (
            <>
              {/* Disease Analysis and Remedies Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-12"
              >
                {/* Disease Analysis Results */}
                <div className="mb-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-red-800 mb-2">
                        {diseaseDetected}
                      </h3>
                      <p className="text-red-700 font-medium text-xl mb-2">{analysisState.result.disease}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-red-600">{confidence}: {analysisState.result.confidence.toFixed(2)}%</span>
                    
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remedies Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{immediateActionsTitle}</h3>
                  {remediesState.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      <span className="ml-3 text-gray-600">Loading remedies...</span>
                    </div>
                  ) : remediesState.error ? (
                    <div className="text-center py-8 text-red-600">
                      {remediesState.error}
                    </div>
                  ) : remediesState.isComplete && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Immediate Actions - Blue Theme */}
                      <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl h-full">
                        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-blue-600" />
                          Immediate Actions
                        </h3>
                        {remediesState.immediateActions.length > 0 ? (
                          <ul className="space-y-3">
                            {remediesState.immediateActions.slice(1).map((action, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                                  {index + 1}
                                </div>
                                <div 
                                  className="text-blue-700 prose prose-blue max-w-none"
                                  dangerouslySetInnerHTML={{ __html: action }}
                                />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-blue-600 italic">No immediate actions available.</p>
                        )}
                      </div>

                      {/* Future Prevention - Green Theme */}
                      <div className="p-6 bg-green-50 border border-green-200 rounded-xl h-full">
                        <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          Future Prevention
                        </h3>
                        {remediesState.futurePrevention.length > 0 ? (
                          <ul className="space-y-3">
                            {remediesState.futurePrevention.slice(1).map((prev, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                                  {index + 1}
                                </div>
                                <div 
                                  className="text-green-700 prose prose-green max-w-none"
                                  dangerouslySetInnerHTML={{ __html: prev }}
                                />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-green-600 italic">No prevention measures available.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Chatbot Section */}
              {analysisState.isComplete && remediesState.isComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{chatTitle}</h3>
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
                            {message.type === 'user' ? (
                              <p className="text-sm leading-relaxed">{message.message}</p>
                            ) : (
                              <FormattedMessage message={message.message} />
                            )}
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

                  {/* Chat Input */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={chatPlaceholder}
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
                    <p className="text-sm text-gray-500 w-full mb-2">{quickQuestions}</p>
                    {[
                      wateringQuestion,
                      fertilizerQuestion,
                      preventionQuestion,
                      pruningQuestion
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
                </motion.div>
              )}
            </>
          )}

          <AnimatePresence>
            {analysisState.error && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  <span className="text-red-700 font-medium">{analysisState.error}</span>
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