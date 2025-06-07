import { useState, useEffect } from "react"
import { Eye, EyeOff, Mail, Lock, User, Leaf } from "lucide-react"
import { useNavigate } from "react-router-dom"

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  const nav = useNavigate()
  
  useEffect(() => {
    // Trigger entrance animations
    const timer1 = setTimeout(() => setIsVisible(true), 100)
    const timer2 = setTimeout(() => setShowForm(true), 300)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    // Signup-specific validation
    if (!isLogin) {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required"
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password"
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setErrors({})

    const submitData = isLogin 
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password }

    try {
      const response = await fetch('http://localhost:3000/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: isLogin ? 'login' : 'signup',
          ...submitData
        }),
      })

      const result = await response.json()

      if (response.ok) {

        if(result.url){
          nav(result.url)
        }

        setErrors({ 
          general: isLogin 
            ? "Login successful! Welcome back." 
            : "Account created successfully!" 
        })
        // Reset form on success
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        })

      } else {
        setErrors({
          general: result.message || "An error occurred. Please try again.",
        })
      }
    } catch (error) {
      setErrors({
        general: "Unable to connect to server. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleMode = () => {
    setShowForm(false)
    setTimeout(() => {
      setIsLogin(!isLogin)
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
      setErrors({})
      setShowPassword(false)
      setShowConfirmPassword(false)
      setShowForm(true)
    }, 200)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        background: "linear-gradient(135deg, #f8fcf8 0%, #e8f5e8 100%)",
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-green-300 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-green-400 rounded-full opacity-25 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-green-200 rounded-full opacity-20 animate-bounce"></div>
      </div>

      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-white/60" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand Section */}
        <div 
          className={`text-center mb-8 transition-all duration-700 ease-out ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-8'
          }`}
        >
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4 shadow-lg hover:shadow-xl transition-all duration-500 ${
            isVisible ? 'scale-100 rotate-0' : 'scale-75 rotate-12'
          }`}>
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-green-700 mb-2 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text ">
            GreenThumb
          </h1>
          <p className="text-gray-600 text-sm">Your Urban Gardening Companion</p>
        </div>

        {/* Auth Card */}
        <div 
          className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-green-200 p-8 hover:shadow-2xl transition-all duration-700 ease-out transform ${
            showForm 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-8 scale-95'
          }`}
        >
          {/* Toggle Buttons */}
          <div 
            className={`flex bg-gray-100 rounded-lg p-1 mb-6 transition-all duration-500 ease-out ${
              showForm ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`}
          >
            <button
              onClick={() => setIsLogin(true)}
              disabled={isSubmitting}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
                isLogin 
                  ? "bg-green-600 text-white shadow-sm transform scale-105" 
                  : "text-gray-500 hover:text-green-600"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              disabled={isSubmitting}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
                !isLogin 
                  ? "bg-green-600 text-white shadow-sm transform scale-105" 
                  : "text-gray-500 hover:text-green-600"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* General Error/Success Message */}
          {errors.general && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm transition-all duration-500 ease-out transform opacity-100 translate-y-0 ${
                errors.general.includes("successful")
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}
            >
              {errors.general}
            </div>
          )}

          {/* Form */}
          <div 
            className={`space-y-4 transition-all duration-600 ease-out ${
              showForm ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="space-y-4">
              {/* Name Field (Signup only) */}
              {!isLogin && (
                <div 
                  className={`space-y-2 transition-all duration-500 ease-out transform ${
                    showForm ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                  style={{ transitionDelay: '100ms' }}
                >
                  <label htmlFor="name" className="block text-green-700 font-medium text-sm">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:border-green-400 ${
                        errors.name
                          ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                          : "border-green-200 focus:border-green-500 focus:ring-green-200"
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 transition-all duration-300 transform animate-pulse">
                      {errors.name}
                    </p>
                  )}
                </div>
              )}

              {/* Email Field */}
              <div 
                className={`space-y-2 transition-all duration-500 ease-out transform ${
                  showForm ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
                style={{ transitionDelay: !isLogin ? '200ms' : '100ms' }}
              >
                <label htmlFor="email" className="block text-green-700 font-medium text-sm">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:border-green-400 ${
                      errors.email
                        ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                        : "border-green-200 focus:border-green-500 focus:ring-green-200"
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 transition-all duration-300 transform animate-pulse">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div 
                className={`space-y-2 transition-all duration-500 ease-out transform ${
                  showForm ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
                style={{ transitionDelay: !isLogin ? '300ms' : '200ms' }}
              >
                <label htmlFor="password" className="block text-green-700 font-medium text-sm">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:border-green-400 ${
                      errors.password
                        ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                        : "border-green-200 focus:border-green-500 focus:ring-green-200"
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-500 transition-colors disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 transition-all duration-300 transform animate-pulse">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field (Signup only) */}
              {!isLogin && (
                <div 
                  className={`space-y-2 transition-all duration-500 ease-out transform ${
                    showForm ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                  style={{ transitionDelay: '400ms' }}
                >
                  <label htmlFor="confirmPassword" className="block text-green-700 font-medium text-sm">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:border-green-400 ${
                        errors.confirmPassword
                          ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                          : "border-green-200 focus:border-green-500 focus:ring-green-200"
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isSubmitting}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-500 transition-colors disabled:opacity-50"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1 transition-all duration-300 transform animate-pulse">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div 
              className={`pt-6 transition-all duration-600 ease-out transform ${
                showForm ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
              }`}
              style={{ transitionDelay: !isLogin ? '500ms' : '300ms' }}
            >
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {isLogin ? "Signing In..." : "Creating Account..."}
                  </>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </div>

          {/* Toggle Link */}
          <div 
            className={`text-center mt-6 transition-all duration-500 ease-out transform ${
              showForm ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: !isLogin ? '600ms' : '400ms' }}
          >
            <p className="text-sm text-gray-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={toggleMode}
                disabled={isSubmitting}
                className="text-green-500 hover:text-green-700 font-medium transition-colors disabled:opacity-50 hover:underline"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
      `}</style>
    </div>
  )
}

export default AuthForm