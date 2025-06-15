const API_URL = 'http://localhost:8000';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get response from chatbot');
  }
  return response.json();
};

export const chatbotService = {
  // Send a message to the chatbot and get a response
  sendMessage: async (message, context = {}) => {
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context // Include any relevant context like disease analysis results
        })
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Chatbot error:', error);
      throw error;
    }
  },

  // Get remedies for a specific disease
  getRemedy: async (disease) => {
    try {
      const response = await fetch(`${API_URL}/remedy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ disease })
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Remedy error:', error);
      throw error;
    }
  }
}; 